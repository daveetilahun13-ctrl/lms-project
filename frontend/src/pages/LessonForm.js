import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function LessonForm() {
  const { courseId, lessonId } = useParams();
  const isEdit = Boolean(lessonId);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [error, setError] = useState('');
  const [resolvedCourseId, setResolvedCourseId] = useState(courseId);

  useEffect(() => {
    if (isEdit) {
      api.get(`/lessons/${lessonId}`).then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setVideoUrl(res.data.video_url);
        setOrderIndex(res.data.order_index);
        setResolvedCourseId(res.data.course_id);
      });
    }
  }, [lessonId, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { title, content, video_url: videoUrl, order_index: Number(orderIndex) };
    try {
      if (isEdit) {
        await api.put(`/lessons/${lessonId}`, payload);
        navigate(`/courses/${resolvedCourseId}`);
      } else {
        await api.post(`/lessons/course/${courseId}`, payload);
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save lesson.');
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 640 }}>
      <Link to={`/courses/${resolvedCourseId}`} className="nav-pill mb-3 d-inline-block" style={{ color: 'var(--brand-600)' }}>
        &larr; Back to course
      </Link>
      <div className="orbit-card p-4">
        <div className="eyebrow">{isEdit ? 'Edit' : 'New'}</div>
        <h2 className="mb-4">{isEdit ? 'Edit Lesson' : 'Add Lesson'}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea
              className="form-control"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Video URL (optional)</label>
            <input
              className="form-control"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Order</label>
            <input
              type="number"
              className="form-control"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-100">{isEdit ? 'Save Changes' : 'Add Lesson'}</button>
        </form>
      </div>
    </div>
  );
}
