const {
  createLesson, getLessonsByCourse, getLessonById, updateLesson, deleteLesson
} = require('../models/lessonModel');
const { getCourseById } = require('../models/courseModel');
const { findEnrollment } = require('../models/enrollmentModel');

// Helper: confirms req.user is the instructor who owns the given course.
// Used before any lesson write operation.
async function assertOwnsCourse(courseId, userId) {
  const course = await getCourseById(courseId);
  if (!course) return { ok: false, status: 404, message: 'Course not found.' };
  if (course.instructor_id !== userId) {
    return { ok: false, status: 403, message: 'You do not own this course.' };
  }
  return { ok: true, course };
}

// POST /api/courses/:courseId/lessons  (instructor, must own the course)
async function create(req, res) {
  try {
    const { courseId } = req.params;
    const check = await assertOwnsCourse(courseId, req.user.id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const { title, content, video_url, order_index } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const lessonId = await createLesson(courseId, title, content || '', video_url || '', order_index || 0);
    const lesson = await getLessonById(lessonId);

    return res.status(201).json({ message: 'Lesson created.', lesson });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error creating lesson.' });
  }
}

// GET /api/courses/:courseId/lessons
// Anyone authenticated can see the lesson LIST (title/order) - this acts as a
// course preview so students can decide whether to enroll. Full lesson
// CONTENT is still gated in getOne() below.
async function getByCourse(req, res) {
  try {
    const lessons = await getLessonsByCourse(req.params.courseId);
    return res.status(200).json(lessons);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching lessons.' });
  }
}

// GET /api/lessons/:id  (owning instructor OR enrolled student only)
async function getOne(req, res) {
  try {
    const lesson = await getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const course = await getCourseById(lesson.course_id);
    const isOwner = course.instructor_id === req.user.id;

    if (!isOwner) {
      const enrollment = await findEnrollment(req.user.id, lesson.course_id);
      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to view this lesson.' });
      }
    }

    return res.status(200).json(lesson);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching lesson.' });
  }
}

// PUT /api/lessons/:id  (instructor, must own the parent course)
async function update(req, res) {
  try {
    const lesson = await getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const check = await assertOwnsCourse(lesson.course_id, req.user.id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const { title, content, video_url, order_index } = req.body;
    await updateLesson(
      req.params.id,
      title || lesson.title,
      content ?? lesson.content,
      video_url ?? lesson.video_url,
      order_index ?? lesson.order_index
    );
    const updated = await getLessonById(req.params.id);

    return res.status(200).json({ message: 'Lesson updated.', lesson: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating lesson.' });
  }
}

// DELETE /api/lessons/:id  (instructor, must own the parent course)
async function remove(req, res) {
  try {
    const lesson = await getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    const check = await assertOwnsCourse(lesson.course_id, req.user.id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    await deleteLesson(req.params.id);
    return res.status(200).json({ message: 'Lesson deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting lesson.' });
  }
}

module.exports = { create, getByCourse, getOne, update, remove };
