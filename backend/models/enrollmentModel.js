const pool = require('../config/db');

async function createEnrollment(studentId, courseId) {
  const [result] = await pool.query(
    'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
    [studentId, courseId]
  );
  return result.insertId;
}

async function findEnrollment(studentId, courseId) {
  const [rows] = await pool.query(
    'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
    [studentId, courseId]
  );
  return rows[0]; // undefined if not enrolled
}

// Returns all courses a student is enrolled in, with course details joined in
async function getEnrollmentsByStudent(studentId) {
  const [rows] = await pool.query(
    `SELECT e.id AS enrollment_id, e.enrolled_at, c.id AS course_id, c.title, c.description, u.name AS instructor_name
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN users u ON c.instructor_id = u.id
     WHERE e.student_id = ?
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );
  return rows;
}

async function getEnrollmentsByCourse(courseId) {
  const [rows] = await pool.query(
    `SELECT e.id AS enrollment_id, e.enrolled_at, u.id AS student_id, u.name, u.email
     FROM enrollments e
     JOIN users u ON e.student_id = u.id
     WHERE e.course_id = ?`,
    [courseId]
  );
  return rows;
}

module.exports = {
  createEnrollment,
  findEnrollment,
  getEnrollmentsByStudent,
  getEnrollmentsByCourse
};
