const db = require('../config/db');

// Enroll a student in a course
const enroll = async (req, res) => {
    const { courseId } = req.body;
    const studentId = req.user.id;
    
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
    }
    
    try {
        // Check if course exists
        const courseResult = await db.query(
            'SELECT * FROM courses WHERE id = $1', [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Check if already enrolled
        const existing = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        
        // Enroll
        await db.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
            [studentId, courseId]
        );
        
        res.status(201).json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error('Error enrolling:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all courses the logged-in student is enrolled in
const getMyEnrollments = async (req, res) => {
    const studentId = req.user.id;
    try {
        const result = await db.query(`
            SELECT c.*, u.name as instructor_name
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            JOIN users u ON c.instructor_id = u.id
            WHERE e.student_id = $1
            ORDER BY e.enrolled_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all students enrolled in a course (instructor only, must own the course)
const getEnrolledStudents = async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    try {
        // Check ownership
        const courseResult = await db.query(
            'SELECT * FROM courses WHERE id = $1', [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (courseResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this course\'s students' });
        }
        
        const result = await db.query(`
            SELECT u.id, u.name, u.email, e.enrolled_at
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            WHERE e.course_id = $1
            ORDER BY e.enrolled_at DESC
        `, [courseId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching enrolled students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    enroll,
    getMyEnrollments,
    getEnrolledStudents
};