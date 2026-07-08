import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEnroll(courseId) {
    setMessage('');
    try {
      const res = await api.post('/enrollments', { course_id: courseId });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not enroll.');
    }
  }

  return (
    <div className="container">
      <h2 className="mb-4">Browse Courses</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        {courses.map((course) => (
          <div className="col-md-4 mb-4" key={course.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text text-muted">by {course.instructor_name}</p>
                <p className="card-text flex-grow-1">{course.description}</p>
                <div className="d-flex gap-2">
                  <Link to={`/courses/${course.id}`} className="btn btn-outline-primary btn-sm">
                    View
                  </Link>
                  {user?.role === 'student' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p>No courses available yet.</p>}
      </div>
    </div>
  );
}
