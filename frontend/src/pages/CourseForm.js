import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// One shared component for both "Create Course" and "Edit Course" -
// if :id is present in the URL we're editing, otherwise we're creating.
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
      } else {
        await api.post('/courses', { title, description });
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save course.');
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <h2 className="mb-4">{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Course'}</button>
      </form>
    </div>
  );
}
