const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getCourses,
    getCourseById,
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');

// Public routes (authenticated users)
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourseById);

// Instructor-only routes
router.get('/instructor/mine', authenticate, authorize('instructor'), getMyCourses);
router.post('/', authenticate, authorize('instructor'), createCourse);
router.put('/:id', authenticate, authorize('instructor'), updateCourse);
router.delete('/:id', authenticate, authorize('instructor'), deleteCourse);

module.exports = router;
