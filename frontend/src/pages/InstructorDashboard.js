import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/courses/mine');
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your courses.');
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
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Courses</h2>
        <Link to="/instructor/courses/new" className="btn btn-success">+ New Course</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {courses.map((course) => (
          <div className="col-md-4 mb-4" key={course.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{course.title}</h5>
                <p className="card-text flex-grow-1">{course.description}</p>
                <div className="d-flex gap-2">
                  <Link to={`/courses/${course.id}`} className="btn btn-outline-primary btn-sm">Manage</Link>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="btn btn-outline-secondary btn-sm">Edit</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(course.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p>You haven't created any courses yet.</p>}
      </div>
    </div>
  );
}
