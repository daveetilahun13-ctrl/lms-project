import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Shared component for both "Add Lesson" (courseId in URL) and
// "Edit Lesson" (lessonId in URL) - mirrors the CourseForm pattern.
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
        await api.post(`/courses/${courseId}/lessons`, payload);
        navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save lesson.');
    }
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
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
        <div className="mb-3">
          <label className="form-label">Order</label>
          <input
            type="number"
            className="form-control"
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Lesson'}</button>
      </form>
    </div>
  );
}
