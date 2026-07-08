const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { create, getByCourse, getOne, update, remove } = require('../controllers/lessonController');

// Nested under a course: /api/courses/:courseId/lessons
router.get('/courses/:courseId/lessons', verifyToken, getByCourse);
router.post('/courses/:courseId/lessons', verifyToken, authorize('instructor'), create);

// Flat, by lesson id: /api/lessons/:id
router.get('/lessons/:id', verifyToken, getOne);
router.put('/lessons/:id', verifyToken, authorize('instructor'), update);
router.delete('/lessons/:id', verifyToken, authorize('instructor'), remove);

module.exports = router;
