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

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/courses/instructor/mine');
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your courses.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(courseId) {
    if (!window.confirm('Delete this course and all of its lessons?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course.');
    }
  }

  return (
    <div className="page-shell">
      <div className="hero-banner">
        <div className="eyebrow" style={{ color: '#c7d2fe' }}>Instructor Dashboard</div>
        <h1 style={{ color: '#fff', fontSize: '1.9rem', margin: 0 }}>
          Hey {user?.name?.split(' ')[0]}, ready to teach? 🧑‍🏫
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', marginBottom: 0 }}>
          Manage your courses, add lessons, and keep your content polished.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--brand-100)' }}>📚</div>
            <div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Courses created</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>✍️</div>
            <div>
              <div className="stat-value">{courses.length > 0 ? 'Active' : '—'}</div>
              <div className="stat-label">Publishing status</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>🚀</div>
            <div>
              <div className="stat-value">Live</div>
              <div className="stat-label">Platform status</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">My Courses</h2>
          <p className="page-subtitle">Everything you're currently teaching.</p>
        </div>
        <Link to="/instructor/courses/new" className="btn btn-success">+ New Course</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-muted">Loading your courses...</p>}

      <div className="row">
        {courses.map((course, i) => (
          <div className="col-md-4 mb-4" key={course.id}>
            <div className="orbit-card h-100 d-flex flex-column overflow-hidden">
              <div
                className="course-card-cover"
                style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}
              >
                <span className="course-card-icon">🎯</span>
              </div>
              <div className="card-body d-flex flex-column p-3">
                <h5 className="card-title mb-1" style={{ fontSize: '1.05rem' }}>{course.title}</h5>
                <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.85rem' }}>
                  {course.description || 'No description yet.'}
                </p>
                <div className="d-flex gap-2 mt-2">
                  <Link to={`/courses/${course.id}`} className="btn btn-outline-primary btn-sm">Manage</Link>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="btn btn-outline-secondary btn-sm">Edit</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && courses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🧑‍🏫</div>
            <h5>No courses yet</h5>
            <p className="text-muted mb-3">Create your first course to start teaching.</p>
            <Link to="/instructor/courses/new" className="btn btn-success">+ New Course</Link>
          </div>
        )}
      </div>
    </div>
  );
}
