const db = require('../config/db');

// Get all lessons for a course (preview – only title, order)
const getLessonsByCourse = async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await db.query(`
            SELECT id, title, order_index 
            FROM lessons 
            WHERE course_id = $1 
            ORDER BY order_index ASC
        `, [courseId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single lesson (full content – only if enrolled or instructor)
const getLessonById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    try {
        // Get lesson with course info
        const lessonResult = await db.query(`
            SELECT l.*, c.instructor_id, c.title as course_title
            FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = $1
        `, [id]);
        
        if (lessonResult.rows.length === 0) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        
        const lesson = lessonResult.rows[0];
        const courseId = lesson.course_id;
        const instructorId = lesson.instructor_id;
        
        // Check if user is instructor or enrolled
        if (userRole === 'instructor' && instructorId === userId) {
            return res.json(lesson);
        }
        
        // Check enrollment
        const enrollResult = await db.query(`
            SELECT * FROM enrollments 
            WHERE student_id = $1 AND course_id = $2
        `, [userId, courseId]);
        
        if (enrollResult.rows.length === 0) {
            return res.status(403).json({ message: 'You must be enrolled in this course to view the lesson' });
        }
        
        res.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new lesson (instructor only, must own the course)
const createLesson = async (req, res) => {
    const { courseId } = req.params;
    const { title, content, video_url, order_index } = req.body;
    const userId = req.user.id;
    
    try {
        // Check course ownership
        const courseResult = await db.query(
            'SELECT * FROM courses WHERE id = $1', [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (courseResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
        }
        
        const result = await db.query(`
            INSERT INTO lessons (course_id, title, content, video_url, order_index)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [courseId, title, content, video_url, order_index || 0]);
        
        res.status(201).json({ 
            message: 'Lesson created successfully',
            lessonId: result.rows[0].id
        });
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update a lesson (instructor only, must own the course)
const updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, content, video_url, order_index } = req.body;
    const userId = req.user.id;
    
    try {
        // Get lesson and check ownership via course
        const lessonResult = await db.query(`
            SELECT l.*, c.instructor_id 
            FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = $1
        `, [id]);
        
        if (lessonResult.rows.length === 0) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        if (lessonResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this lesson' });
        }
        
        await db.query(`
            UPDATE lessons 
            SET title = $1, content = $2, video_url = $3, order_index = $4
            WHERE id = $5
        `, [title, content, video_url, order_index, id]);
        
        res.json({ message: 'Lesson updated successfully' });
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a lesson (instructor only, must own the course)
const deleteLesson = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const lessonResult = await db.query(`
            SELECT l.*, c.instructor_id 
            FROM lessons l
            JOIN courses c ON l.course_id = c.id
            WHERE l.id = $1
        `, [id]);
        
        if (lessonResult.rows.length === 0) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        if (lessonResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this lesson' });
        }
        
        await db.query('DELETE FROM lessons WHERE id = $1', [id]);
        res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLessonsByCourse,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};