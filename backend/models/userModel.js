const pool = require('../config/db');

// The Model layer only talks to the database. It never touches
// req/res — that's the controller's job. This keeps MVC clean.

async function createUser(name, email, hashedPassword, role) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  return result.insertId;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0]; // undefined if not found
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = { createUser, findByEmail, findById };
