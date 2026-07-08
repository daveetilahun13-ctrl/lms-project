const {
  createEnrollment, findEnrollment, getEnrollmentsByStudent, getEnrollmentsByCourse
} = require('../models/enrollmentModel');
const { getCourseById } = require('../models/courseModel');

// POST /api/enrollments  (student only)  body: { course_id }
async function enroll(req, res) {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ message: 'course_id is required.' });

    const course = await getCourseById(course_id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const existing = await findEnrollment(req.user.id, course_id);
    if (existing) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }

    await createEnrollment(req.user.id, course_id);
    return res.status(201).json({ message: `Enrolled in "${course.title}" successfully.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error enrolling in course.' });
  }
}

// GET /api/enrollments/my  (student only) - powers the student dashboard
async function myEnrollments(req, res) {
  try {
    const enrollments = await getEnrollmentsByStudent(req.user.id);
    return res.status(200).json(enrollments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching enrollments.' });
  }
}

// GET /api/enrollments/course/:courseId  (instructor only, must own the course)
async function courseEnrollments(req, res) {
  try {
    const course = await getCourseById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (course.instructor_id !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this course.' });
    }

    const students = await getEnrollmentsByCourse(req.params.courseId);
    return res.status(200).json(students);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching course enrollments.' });
  }
}

module.exports = { enroll, myEnrollments, courseEnrollments };
