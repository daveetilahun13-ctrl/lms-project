const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findByEmail } = require('../models/userModel');
require('dotenv').config();

const SALT_ROUNDS = 10; // cost factor for bcrypt - 10 is a solid, standard default

// Helper: builds a signed JWT containing the user's id and role.
// We deliberately keep the payload small - just enough to authorize requests.
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!['student', 'instructor'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either student or instructor.' });
    }

    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Never store plain-text passwords - hash before saving.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = await createUser(name, email, hashedPassword, role);

    const user = { id: userId, role };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await findByEmail(email);
    if (!user) {
      // Same message for "no user" and "wrong password" - avoids leaking
      // which emails are registered.
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
}

module.exports = { register, login };
