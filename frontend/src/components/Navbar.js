import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  const dashboardPath = user?.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';

  return (
    <nav className="orbit-navbar mb-4">
      <div className="container d-flex align-items-center justify-content-between">
        <Link className="orbit-brand" to="/">
          <span className="orbit-brand-mark">🪐</span>
          ኑ እንማር
        </Link>

        <div className="d-flex align-items-center gap-2">
          {!user && (
            <>
              <Link className="nav-ghost" to="/login">Log in</Link>
              <Link className="nav-cta" to="/register">Get started</Link>
            </>
          )}

          {user && (
            <>
              <NavLink
                className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
                to={dashboardPath}
              >
                Dashboard
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
                to="/courses"
              >
                Browse Courses
              </NavLink>

              <div className="avatar-chip ms-2">
                <div className="avatar-circle">{initials}</div>
                <div>
                  <div className="avatar-name">{user.name}</div>
                  <div className="avatar-role">{user.role}</div>
                </div>
              </div>

              <button className="nav-ghost border-0 bg-transparent" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
