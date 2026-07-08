import React, { createContext, useState, useContext } from 'react';

// AuthContext holds the logged-in user + token so any component
// (Navbar, PrivateRoute, dashboards) can read "who is logged in"
// without prop-drilling it through every layer.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize from localStorage so a page refresh doesn't log the user out.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  function login(userData, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components just call useAuth() instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}
