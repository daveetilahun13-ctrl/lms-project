import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null); // null until we know enrollment status
  const [error, setError] = useState('');

  const isOwner = user?.role === 'instructor' && course && course.instructor_id === user.id;

  const loadProgress = useCallback(async () => {
    if (user?.role !== 'student') return;
    try {
      const res = await api.get(`/progress/course/${id}`);
      setProgress(res.data);
    } catch (err) {
      // A 403 here just means the student hasn't enrolled yet - not a real error.
      setProgress(null);
    }
  }, [id, user]);

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/lessons/course/${id}`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load course.');
      }
    }
    load();
    loadProgress();
  }, [id, loadProgress]);

  async function handleDeleteLesson(lessonId) {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete lesson.');
    }
  }

  if (error) return <div className="page-shell"><div className="alert alert-danger">{error}</div></div>;
  if (!course) return <div className="page-shell"><p className="text-muted">Loading...</p></div>;

  // Build a quick lookup of completion status per lesson (student view only)
  const completionMap = {};
  if (progress) {
    progress.lessons.forEach((l) => { completionMap[l.lesson_id] = l.completed; });
  }

  return (
    <div className="page-shell">
      <div className="hero-banner">
        <div className="eyebrow" style={{ color: '#c7d2fe' }}>Course</div>
        <h1 style={{ color: '#fff', fontSize: '1.9rem', margin: 0 }}>{course.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.4rem', marginBottom: '1rem' }}>
          by {course.instructor_name}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 640, marginBottom: 0 }}>{course.description}</p>

        {isOwner && (
          <div className="mt-3 d-flex gap-2">
            <Link to={`/instructor/courses/${course.id}/edit`} className="nav-ghost">Edit Course</Link>
            <Link to={`/instructor/courses/${course.id}/lessons/new`} className="nav-cta">+ Add Lesson</Link>
          </div>
        )}
      </div>

      {user?.role === 'student' && progress && (
        <div className="orbit-card p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Your progress</span>
            <span className="badge-soft badge-soft-brand">{progress.percentage}% complete</span>
          </div>
          <div className="progress">
            <div
              className="progress-bar progress-bar-custom"
              role="progressbar"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {user?.role === 'student' && !progress && (
        <div className="alert alert-warning">
          Enroll in this course from the Browse Courses page to unlock lessons and track your progress.
        </div>
      )}

      <h4 className="mb-3">Lessons</h4>
      <div>
        {lessons.map((lesson, i) => (
          <div key={lesson.id} className={`lesson-row ${completionMap[lesson.id] ? 'completed' : ''}`}>
            <div className="lesson-check">{completionMap[lesson.id] ? '✓' : i + 1}</div>
            <Link to={`/lessons/${lesson.id}`} className="lesson-title flex-grow-1">
              {lesson.title}
            </Link>
            {isOwner && (
              <div className="d-flex gap-2">
                <Link
                  to={`/instructor/courses/${course.id}/lessons/${lesson.id}/edit`}
                  className="btn btn-outline-secondary btn-sm"
                >
                  Edit
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteLesson(lesson.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <p className="text-muted mb-0">No lessons added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
