const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    enroll,
    getMyEnrollments,
    getEnrolledStudents
} = require('../controllers/enrollmentController');

router.post('/', authenticate, authorize('student'), enroll);
router.get('/my', authenticate, authorize('student'), getMyEnrollments);
router.get('/course/:courseId', authenticate, authorize('instructor'), getEnrolledStudents);

module.exports = router;
