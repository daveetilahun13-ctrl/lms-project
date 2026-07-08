const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Public routes - no token required, since the user doesn't have one yet
router.post('/register', register);
router.post('/login', login);

module.exports = router;
