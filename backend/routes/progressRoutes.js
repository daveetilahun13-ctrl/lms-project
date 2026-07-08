const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { markProgress, getCourseProgress } = require('../controllers/progressController');

router.post('/', verifyToken, authorize('student'), markProgress);
router.get('/course/:courseId', verifyToken, authorize('student'), getCourseProgress);

module.exports = router;
