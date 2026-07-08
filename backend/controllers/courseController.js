const {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByInstructor,
  updateCourse,
  deleteCourse
} = require('../models/courseModel');

// POST /api/courses  (instructor only)
async function create(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // req.user.id comes from the verified JWT - the instructor can only
    // ever create a course owned by themselves, never on someone else's behalf.
    const courseId = await createCourse(title, description || '', req.user.id);
    const course = await getCourseById(courseId);

    return res.status(201).json({ message: 'Course created.', course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error creating course.' });
  }
}

// GET /api/courses  (any authenticated user - students browse, instructors see all)
async function getAll(req, res) {
  try {
    const courses = await getAllCourses();
    return res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching courses.' });
  }
}

// GET /api/courses/mine  (instructor only - "my courses" for their dashboard)
async function getMine(req, res) {
  try {
    const courses = await getCoursesByInstructor(req.user.id);
    return res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching your courses.' });
  }
}

// GET /api/courses/:id  (any authenticated user)
async function getOne(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    return res.status(200).json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching course.' });
  }
}

// PUT /api/courses/:id  (instructor only, and only if they own the course)
async function update(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    // Ownership check: authorization isn't just "is this an instructor",
    // it's "is this THE instructor who owns this specific course".
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own courses.' });
    }

    const { title, description } = req.body;
    await updateCourse(req.params.id, title || course.title, description ?? course.description);
    const updated = await getCourseById(req.params.id);

    return res.status(200).json({ message: 'Course updated.', course: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating course.' });
  }
}

// DELETE /api/courses/:id  (instructor only, and only if they own the course)
async function remove(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own courses.' });
    }

    await deleteCourse(req.params.id);
    return res.status(200).json({ message: 'Course deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting course.' });
  }
}

module.exports = { create, getAll, getMine, getOne, update, remove };
