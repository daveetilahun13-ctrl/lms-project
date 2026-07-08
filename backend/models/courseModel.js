const pool = require('../config/db');

async function createCourse(title, description, instructorId) {
  const [result] = await pool.query(
    'INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)',
    [title, description, instructorId]
  );
  return result.insertId;
}

// Joins instructor name so the frontend doesn't need a second request per course
async function getAllCourses() {
  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.description, c.instructor_id, c.created_at, u.name AS instructor_name
     FROM courses c
     JOIN users u ON c.instructor_id = u.id
     ORDER BY c.created_at DESC`
  );
  return rows;
}

async function getCourseById(id) {
  const [rows] = await pool.query(
    `SELECT c.id, c.title, c.description, c.instructor_id, c.created_at, u.name AS instructor_name
     FROM courses c
     JOIN users u ON c.instructor_id = u.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0];
}

async function getCoursesByInstructor(instructorId) {
  const [rows] = await pool.query(
    'SELECT * FROM courses WHERE instructor_id = ? ORDER BY created_at DESC',
    [instructorId]
  );
  return rows;
}

async function updateCourse(id, title, description) {
  await pool.query(
    'UPDATE courses SET title = ?, description = ? WHERE id = ?',
    [title, description, id]
  );
}

async function deleteCourse(id) {
  await pool.query('DELETE FROM courses WHERE id = ?', [id]);
}

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByInstructor,
  updateCourse,
  deleteCourse
};
