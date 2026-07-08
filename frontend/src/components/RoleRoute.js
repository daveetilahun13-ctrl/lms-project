import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Client-side mirror of the backend's role-based authorization.
// NOTE: this is a UX convenience only - the backend still enforces
// the real permission check on every API call, since a user could
// bypass frontend routing entirely.
export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
