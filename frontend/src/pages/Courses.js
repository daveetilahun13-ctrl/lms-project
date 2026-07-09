import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCourses();
    if (user?.role === 'student') loadEnrollments();
  }, [user]);

  async function loadCourses() {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEnrollments() {
    try {
      const res = await api.get('/enrollments/my');
      setEnrolledIds(new Set(res.data.map((e) => e.course_id)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEnroll(courseId) {
    setMessage('');
    try {
      const res = await api.post('/enrollments', { courseId });
      setMessage(res.data.message);
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not enroll.');
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Catalog</div>
          <h2 className="page-title">Browse Courses</h2>
          <p className="page-subtitle">Discover something new to learn.</p>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <p className="text-muted">Loading courses...</p>}

      <div className="row">
        {courses.map((course, i) => {
          const isEnrolled = enrolledIds.has(course.id);
          return (
            <div className="col-md-4 mb-4" key={course.id}>
              <div className="orbit-card h-100 d-flex flex-column overflow-hidden">
                <div
                  className="course-card-cover"
                  style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}
                >
                  <span className="course-card-icon">✨</span>
                </div>
                <div className="card-body d-flex flex-column p-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title mb-0" style={{ fontSize: '1.05rem' }}>{course.title}</h5>
                    {isEnrolled && <span className="badge-soft badge-soft-success">Enrolled</span>}
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>by {course.instructor_name}</p>
                  <p className="card-text flex-grow-1" style={{ fontSize: '0.88rem' }}>{course.description}</p>
                  <div className="d-flex gap-2 mt-2">
                    <Link to={`/courses/${course.id}`} className="btn btn-outline-primary btn-sm">
                      View
                    </Link>
                    {user?.role === 'student' && !isEnrolled && (
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
          );
        })}
        {!loading && courses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <h5>No courses available yet</h5>
            <p className="text-muted mb-0">Check back soon — instructors are still setting things up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
