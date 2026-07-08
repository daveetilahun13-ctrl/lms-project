const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { enroll, myEnrollments, courseEnrollments } = require('../controllers/enrollmentController');

router.post('/', verifyToken, authorize('student'), enroll);
router.get('/my', verifyToken, authorize('student'), myEnrollments);
router.get('/course/:courseId', verifyToken, authorize('instructor'), courseEnrollments);

module.exports = router;
