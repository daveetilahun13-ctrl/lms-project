import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});

  useEffect(() => {
    async function load() {
      const res = await api.get('/enrollments/my');
      setEnrollments(res.data);

      // Fetch progress for each enrolled course in parallel
      const entries = await Promise.all(
        res.data.map(async (e) => {
          const p = await api.get(`/progress/course/${e.course_id}`);
          return [e.course_id, p.data];
        })
      );
      setProgressByCourse(Object.fromEntries(entries));
    }
    load();
  }, []);

  return (
    <div className="container">
      <h2 className="mb-4">My Courses</h2>
      <div className="row">
        {enrollments.map((e) => {
          const progress = progressByCourse[e.course_id];
          return (
            <div className="col-md-4 mb-4" key={e.enrollment_id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{e.title}</h5>
                  <p className="text-muted">by {e.instructor_name}</p>
                  {progress && (
                    <div className="mb-2">
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-custom"
                          style={{ width: `${progress.percent}%` }}
                        >
                          {progress.percent}%
                        </div>
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
        {enrollments.length === 0 && (
          <p>
            You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
