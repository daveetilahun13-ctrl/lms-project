import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="eyebrow" style={{ color: '#a5b4fc' }}>ኑ እንማር</div>
        <h1 className="display-font" style={{ color: '#fff', fontSize: '2.3rem', maxWidth: 420 }}>
          Teach or learn — your dashboard adapts to you.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 380, marginTop: '1rem' }}>
          Instructors build courses and track their students. Students enroll,
          learn, and watch their progress climb in real time.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Create an account</h2>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            It only takes a minute.
          </p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">I am a...</label>
              <div className="d-flex gap-2">
                {['student', 'instructor'].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className="btn flex-fill"
                    style={{
                      textTransform: 'capitalize',
                      border: form.role === r ? '1.5px solid var(--brand-500)' : '1.5px solid var(--border)',
                      background: form.role === r ? 'var(--brand-50)' : '#fff',
                      color: form.role === r ? 'var(--brand-700)' : 'var(--ink-700)',
                      boxShadow: 'none',
                    }}
                  >
                    {r === 'student' ? '🎓 ' : '🧑‍🏫 '}{r}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary w-100 mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-3 mb-0 text-center" style={{ fontSize: '0.88rem' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
