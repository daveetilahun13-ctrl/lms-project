import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">LMS</Link>
        <div className="d-flex ms-auto">
          {!user && (
            <>
              <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
              <Link className="btn btn-light" to="/register">Register</Link>
            </>
          )}

          {user && user.role === 'student' && (
            <Link className="btn btn-outline-light me-2" to="/student/dashboard">My Dashboard</Link>
          )}
          {user && user.role === 'instructor' && (
            <Link className="btn btn-outline-light me-2" to="/instructor/dashboard">My Dashboard</Link>
          )}
          {user && (
            <>
              <Link className="btn btn-outline-light me-2" to="/courses">Browse Courses</Link>
              <button className="btn btn-warning" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
