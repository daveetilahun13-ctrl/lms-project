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

        // Pull existing completion state so the checkbox reflects reality
        // on load, instead of always starting unchecked.
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
      await api.post('/progress', { lesson_id: Number(id), completed: next });
      setCompleted(next);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update progress.');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
        <Link to="/courses" className="btn btn-outline-primary">Back to Courses</Link>
      </div>
    );
  }
  if (!lesson) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <Link to={`/courses/${lesson.course_id}`} className="btn btn-link ps-0">&larr; Back to course</Link>
      <h2>{lesson.title}</h2>

      {lesson.video_url && (
        <div className="mb-3">
          <a href={lesson.video_url} target="_blank" rel="noreferrer">Watch lesson video</a>
        </div>
      )}

      <p style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</p>

      {user?.role === 'student' && (
        <div className="form-check mt-4">
          <input
            className="form-check-input"
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
            disabled={saving}
            id="completeCheck"
          />
          <label className="form-check-label" htmlFor="completeCheck">
            Mark this lesson as completed
          </label>
        </div>
      )}
    </div>
  );
}
