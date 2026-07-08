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
          api.get(`/courses/${id}/lessons`)
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

  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;
  if (!course) return <div className="container">Loading...</div>;

  // Build a quick lookup of completion status per lesson (student view only)
  const completionMap = {};
  if (progress) {
    progress.lessons.forEach((l) => { completionMap[l.lesson_id] = l.completed; });
  }

  return (
    <div className="container">
      <h2>{course.title}</h2>
      <p className="text-muted">by {course.instructor_name}</p>
      <p>{course.description}</p>

      {isOwner && (
        <div className="mb-3 d-flex gap-2">
          <Link to={`/instructor/courses/${course.id}/edit`} className="btn btn-outline-secondary btn-sm">
            Edit Course
          </Link>
          <Link to={`/instructor/courses/${course.id}/lessons/new`} className="btn btn-success btn-sm">
            + Add Lesson
          </Link>
        </div>
      )}

      {user?.role === 'student' && progress && (
        <div className="mb-3">
          <label className="form-label">Your progress: {progress.percent}%</label>
          <div className="progress">
            <div
              className="progress-bar progress-bar-custom"
              role="progressbar"
              style={{ width: `${progress.percent}%` }}
            >
              {progress.percent}%
            </div>
          </div>
        </div>
      )}

      {user?.role === 'student' && !progress && (
        <div className="alert alert-warning">
          Enroll in this course from the Browse Courses page to unlock lessons and track your progress.
        </div>
      )}

      <h4 className="mt-4">Lessons</h4>
      <ul className="list-group">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className={`list-group-item d-flex justify-content-between align-items-center lesson-list-item ${
              completionMap[lesson.id] ? 'completed' : ''
            }`}
          >
            <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
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
          </li>
        ))}
        {lessons.length === 0 && <li className="list-group-item">No lessons added yet.</li>}
      </ul>
    </div>
  );
}
