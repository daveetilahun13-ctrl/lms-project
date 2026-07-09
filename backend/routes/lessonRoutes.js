const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
} = require('../controllers/lessonController');

// Get all lessons for a course (preview)
router.get('/course/:courseId', authenticate, getLessonsByCourse);

// Get a single lesson (full content – access controlled in controller)
router.get('/:id', authenticate, getLessonById);

// Instructor-only routes
router.post('/course/:courseId', authenticate, authorize('instructor'), createLesson);
router.put('/:id', authenticate, authorize('instructor'), updateLesson);
router.delete('/:id', authenticate, authorize('instructor'), deleteLesson);

module.exports = router;
