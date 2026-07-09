import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="eyebrow" style={{ color: '#a5b4fc' }}>Welcome back</div>
        <h1 className="display-font" style={{ color: '#fff', fontSize: '2.3rem', maxWidth: 420 }}>
          Pick up right where you left off.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 380, marginTop: '1rem' }}>
          Track your courses, keep your progress in sync, and stay close to
          everything your instructors are teaching.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="mb-1" style={{ fontSize: '1.5rem' }}>Log in</h2>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            Enter your details to access your dashboard.
          </p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100 mt-2" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="mt-3 mb-0 text-center" style={{ fontSize: '0.88rem' }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
