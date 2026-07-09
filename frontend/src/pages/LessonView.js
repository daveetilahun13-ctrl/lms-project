import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LessonView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/lessons/${id}`);
        setLesson(res.data);

        if (user?.role === 'student') {
          const progressRes = await api.get(`/progress/course/${res.data.course_id}`);
          const match = progressRes.data.lessons.find((l) => l.lesson_id === Number(id));
          if (match) setCompleted(match.completed);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load lesson.');
      }
    }
    load();
  }, [id, user]);

  async function handleToggleComplete() {
    setSaving(true);
    try {
      const next = !completed;
      await api.post('/progress', { lessonId: Number(id), completed: next });
      setCompleted(next);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update progress.');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="page-shell" style={{ maxWidth: 760 }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/courses" className="btn btn-outline-primary">Back to Courses</Link>
      </div>
    );
  }
  if (!lesson) return <div className="page-shell"><p className="text-muted">Loading...</p></div>;

  return (
    <div className="page-shell" style={{ maxWidth: 760 }}>
      <Link to={`/courses/${lesson.course_id}`} className="nav-pill mb-3 d-inline-block" style={{ color: 'var(--brand-600)' }}>
        &larr; Back to course
      </Link>

      <div className="orbit-card p-4">
        <div className="eyebrow">Lesson</div>
        <h2 className="mb-3">{lesson.title}</h2>

        {lesson.video_url && (
  <a
    href={lesson.video_url}
    target="_blank"
    rel="noreferrer"
    className="badge-soft badge-soft-brand mb-3 d-inline-flex text-decoration-none"
  >
    ▶️ Watch lesson video
  </a>
)}

        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-700)', lineHeight: 1.7 }}>{lesson.content}</p>

        {user?.role === 'student' && (
          <button
            className={`btn mt-3 ${completed ? 'btn-outline-primary' : 'btn-success'}`}
            onClick={handleToggleComplete}
            disabled={saving}
          >
            {completed ? '✓ Completed — mark as incomplete' : 'Mark as completed'}
          </button>
        )}
      </div>
    </div>
  );
}
