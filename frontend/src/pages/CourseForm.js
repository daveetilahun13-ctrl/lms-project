import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';


export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/courses/${id}`).then((res) => {
        setTitle(res.data.title);
        setDescription(res.data.description);
      });
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/courses/${id}`, { title, description });
        navigate(`/courses/${id}`);
      } else {
        await api.post('/courses', { title, description });
        navigate('/instructor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save course.');
    }
  }

  return (
    <div className="page-shell" style={{ maxWidth: 560 }}>
      <Link to="/instructor/dashboard" className="nav-pill mb-3 d-inline-block" style={{ color: 'var(--brand-600)' }}>
        &larr; Back to dashboard
      </Link>
      <div className="orbit-card p-4">
        <div className="eyebrow">{isEdit ? 'Edit' : 'Create'}</div>
        <h2 className="mb-4">{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Intro to Data Structures"
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
            />
          </div>
          <button className="btn btn-primary w-100">{isEdit ? 'Save Changes' : 'Create Course'}</button>
        </form>
      </div>
    </div>
  );
}