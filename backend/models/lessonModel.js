const pool = require('../config/db');

async function createLesson(courseId, title, content, videoUrl, orderIndex) {
  const [result] = await pool.query(
    'INSERT INTO lessons (course_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)',
    [courseId, title, content, videoUrl, orderIndex]
  );
  return result.insertId;
}

async function getLessonsByCourse(courseId) {
  const [rows] = await pool.query(
    'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC, created_at ASC',
    [courseId]
  );
  return rows;
}

async function getLessonById(id) {
  const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
  return rows[0];
}

async function updateLesson(id, title, content, videoUrl, orderIndex) {
  await pool.query(
    'UPDATE lessons SET title = ?, content = ?, video_url = ?, order_index = ? WHERE id = ?',
    [title, content, videoUrl, orderIndex, id]
  );
}

async function deleteLesson(id) {
  await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
}

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson
};
