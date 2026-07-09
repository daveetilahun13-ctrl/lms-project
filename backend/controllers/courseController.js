const db = require('../config/db');

// Get all courses (with instructor name)
const getCourses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT c.*, u.name as instructor_name 
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get course by ID (with instructor and lessons)
const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        // Get course with instructor name
        const courseResult = await db.query(`
            SELECT c.*, u.name as instructor_name 
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            WHERE c.id = $1
        `, [id]);
        
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const course = courseResult.rows[0];
        
        // Get lessons for this course
        const lessonsResult = await db.query(`
            SELECT * FROM lessons 
            WHERE course_id = $1 
            ORDER BY order_index ASC
        `, [id]);
        course.lessons = lessonsResult.rows;
        
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get courses taught by the logged-in instructor
const getMyCourses = async (req, res) => {
    const userId = req.user.id; // from JWT
    try {
        const result = await db.query(`
            SELECT * FROM courses 
            WHERE instructor_id = $1 
            ORDER BY created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching my courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    const { title, description } = req.body;
    const instructorId = req.user.id;
    
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }
    
    try {
        const result = await db.query(`
            INSERT INTO courses (title, description, instructor_id) 
            VALUES ($1, $2, $3) 
            RETURNING id
        `, [title, description, instructorId]);
        
        const newCourseId = result.rows[0].id;
        res.status(201).json({ 
            message: 'Course created successfully',
            courseId: newCourseId
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a course
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;
    
    try {
        // Check if course exists and belongs to this instructor
        const checkResult = await db.query(
            'SELECT * FROM courses WHERE id = $1', [id]
        );
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (checkResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        
        await db.query(`
            UPDATE courses 
            SET title = $1, description = $2 
            WHERE id = $3
        `, [title, description, id]);
        
        res.json({ message: 'Course updated successfully' });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete a course
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const checkResult = await db.query(
            'SELECT * FROM courses WHERE id = $1', [id]
        );
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (checkResult.rows[0].instructor_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
        
        await db.query('DELETE FROM courses WHERE id = $1', [id]);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    getMyCourses,
    createCourse,
    updateCourse,
    deleteCourse
};
