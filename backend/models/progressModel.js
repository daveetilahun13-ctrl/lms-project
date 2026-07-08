const pool = require('../config/db');

// "Upsert": if a progress row for this student+lesson already exists, update it;
// otherwise insert a new one. This relies on the UNIQUE KEY(student_id, lesson_id)
// constraint defined in schema.sql.
async function upsertProgress(studentId, lessonId, completed) {
  await pool.query(
    `INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE completed = VALUES(completed), completed_at = VALUES(completed_at)`,
    [studentId, lessonId, completed, completed ? new Date() : null]
  );
}

async function getProgressForCourse(studentId, courseId) {
  const [rows] = await pool.query(
    `SELECT l.id AS lesson_id, l.title, lp.completed, lp.completed_at
     FROM lessons l
     LEFT JOIN lesson_progress lp
       ON lp.lesson_id = l.id AND lp.student_id = ?
     WHERE l.course_id = ?
     ORDER BY l.order_index ASC`,
    [studentId, courseId]
  );
  return rows;
}

module.exports = { upsertProgress, getProgressForCourse };
