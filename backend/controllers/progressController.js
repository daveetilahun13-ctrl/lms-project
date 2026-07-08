const { upsertProgress, getProgressForCourse } = require('../models/progressModel');
const { getLessonById } = require('../models/lessonModel');
const { findEnrollment } = require('../models/enrollmentModel');

// POST /api/progress  (student only)  body: { lesson_id, completed }
async function markProgress(req, res) {
  try {
    const { lesson_id, completed } = req.body;
    if (!lesson_id || typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'lesson_id and boolean completed are required.' });
    }

    const lesson = await getLessonById(lesson_id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    // A student can only track progress on lessons in courses they're enrolled in.
    const enrollment = await findEnrollment(req.user.id, lesson.course_id);
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to track progress.' });
    }

    await upsertProgress(req.user.id, lesson_id, completed);
    return res.status(200).json({ message: 'Progress updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating progress.' });
  }
}

// GET /api/progress/course/:courseId  (student only) - returns per-lesson
// completion plus an overall percentage, for progress bars on the dashboard.
async function getCourseProgress(req, res) {
  try {
    const rows = await getProgressForCourse(req.user.id, req.params.courseId);
    const total = rows.length;
    const completedCount = rows.filter(r => r.completed === 1 || r.completed === true).length;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return res.status(200).json({
      lessons: rows.map(r => ({ ...r, completed: !!r.completed })),
      total,
      completed: completedCount,
      percent
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching progress.' });
  }
}

module.exports = { markProgress, getCourseProgress };
