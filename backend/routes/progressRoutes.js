const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    toggleProgress,
    getProgressByCourse
} = require('../controllers/progressController');

router.post('/', authenticate, authorize('student'), toggleProgress);
router.get('/course/:courseId', authenticate, authorize('student'), getProgressByCourse);

module.exports = router;
