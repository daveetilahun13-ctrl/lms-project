const db = require('../config/db');

// Mark a lesson as complete/incomplete
const toggleProgress = async (req, res) => {
    const { lessonId, completed } = req.body;
    const studentId = req.user.id;
    
    if (lessonId === undefined || completed === undefined) {
        return res.status(400).json({ message: 'lessonId and completed are required' });
    }
    
    try {
        // Check if lesson exists and the student is enrolled in the course
        const lessonResult = await db.query(`
            SELECT l.*, c.id as course_id
            FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = $1
        `, [lessonId]);
        if (lessonResult.rows.length === 0) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        const courseId = lessonResult.rows[0].course_id;
        
        // Check enrollment
        const enrollResult = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (enrollResult.rows.length === 0) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }
        
        // Upsert progress
        if (completed) {
            await db.query(`
                INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                ON CONFLICT (student_id, lesson_id)
                DO UPDATE SET completed = $3, completed_at = CURRENT_TIMESTAMP
            `, [studentId, lessonId, completed]);
        } else {
            await db.query(`
                INSERT INTO lesson_progress (student_id, lesson_id, completed)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_id, lesson_id)
                DO UPDATE SET completed = $3, completed_at = NULL
            `, [studentId, lessonId, completed]);
        }
        
        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get progress for a specific course (list of lessons with completion status)
const getProgressByCourse = async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
    
    try {
        // Check enrollment
        const enrollResult = await db.query(
            'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (enrollResult.rows.length === 0) {
            return res.status(403).json({ message: 'You are not enrolled in this course' });
        }
        
        // Get all lessons with progress
        const result = await db.query(`
            SELECT l.id, l.title, l.order_index,
                   COALESCE(p.completed, false) as completed,
                   p.completed_at
            FROM lessons l
            LEFT JOIN lesson_progress p ON l.id = p.lesson_id AND p.student_id = $1
            WHERE l.course_id = $2
            ORDER BY l.order_index ASC
        `, [studentId, courseId]);
        
        const lessons = result.rows;
        const total = lessons.length;
        const completedCount = lessons.filter(l => l.completed).length;
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        
        res.json({
            courseId: parseInt(courseId),
            totalLessons: total,
            completedLessons: completedCount,
            percentage,
            lessons
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    toggleProgress,
    getProgressByCourse
};