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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.get('/enrollments/my');
      setEnrollments(res.data);

      const entries = await Promise.all(
        res.data.map(async (e) => {
          const p = await api.get(`/progress/course/${e.course_id}`);
          return [e.course_id, p.data];
        })
      );
      setProgressByCourse(Object.fromEntries(entries));
      setLoading(false);
    }
    load();
  }, []);

  const totalCourses = enrollments.length;
  const progressValues = Object.values(progressByCourse);
  const completedCourses = progressValues.filter((p) => p.percentage === 100).length;
  const inProgress = totalCourses - completedCourses;
  const avgProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, p) => sum + p.percentage, 0) / progressValues.length)
    : 0;

  return (
    <div className="page-shell">
      <div className="hero-banner">
        <div className="eyebrow" style={{ color: '#c7d2fe' }}>Student Dashboard</div>
        <h1 style={{ color: '#fff', fontSize: '1.9rem', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', marginBottom: 0 }}>
          {totalCourses > 0
            ? `You're ${avgProgress}% of the way through your enrolled courses on average.`
            : "You haven't enrolled in anything yet — let's fix that."}
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--brand-100)' }}>📚</div>
            <div>
              <div className="stat-value">{totalCourses}</div>
              <div className="stat-label">Enrolled courses</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
            <div>
              <div className="stat-value">{inProgress}</div>
              <div className="stat-label">In progress</div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
            <div>
              <div className="stat-value">{completedCourses}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h2 className="page-title">My Courses</h2>
          <p className="page-subtitle">Jump back into a lesson or explore something new.</p>
        </div>
        <Link to="/courses" className="btn btn-outline-primary">Browse more courses</Link>
      </div>

      {loading && <p className="text-muted">Loading your courses...</p>}

      <div className="row">
        {enrollments.map((e, i) => {
          const progress = progressByCourse[e.course_id];
          return (
            <div className="col-md-4 mb-4" key={e.enrollment_id}>
              <div className="orbit-card h-100 d-flex flex-column overflow-hidden">
                <div
                  className="course-card-cover"
                  style={{ background: COVER_GRADIENTS[i % COVER_GRADIENTS.length] }}
                >
                  <span className="course-card-icon">📘</span>
                </div>
                <div className="card-body d-flex flex-column p-3">
                  <h5 className="card-title mb-1" style={{ fontSize: '1.05rem' }}>{e.title}</h5>
                  <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>by {e.instructor_name}</p>
                  {progress && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                        <span className="text-muted">Progress</span>
                        <span className="fw-bold">{progress.percentage}%</span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-custom"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Link to={`/courses/${e.course_id}`} className="btn btn-primary mt-auto">
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && enrollments.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎒</div>
            <h5>No courses yet</h5>
            <p className="text-muted mb-3">Browse the catalog and enroll in your first course.</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}
