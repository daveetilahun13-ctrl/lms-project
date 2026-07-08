import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseForm from './pages/CourseForm';
import LessonForm from './pages/LessonForm';
import LessonView from './pages/LessonView';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';

// Sends a logged-in user to the right dashboard, or to login if logged out.
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
          <Route path="/lessons/:id" element={<PrivateRoute><LessonView /></PrivateRoute>} />

          <Route
            path="/student/dashboard"
            element={<RoleRoute allowedRoles={['student']}><StudentDashboard /></RoleRoute>}
          />

          <Route
            path="/instructor/dashboard"
            element={<RoleRoute allowedRoles={['instructor']}><InstructorDashboard /></RoleRoute>}
          />
          <Route
            path="/instructor/courses/new"
            element={<RoleRoute allowedRoles={['instructor']}><CourseForm /></RoleRoute>}
          />
          <Route
            path="/instructor/courses/:id/edit"
            element={<RoleRoute allowedRoles={['instructor']}><CourseForm /></RoleRoute>}
          />
          <Route
            path="/instructor/courses/:courseId/lessons/new"
            element={<RoleRoute allowedRoles={['instructor']}><LessonForm /></RoleRoute>}
          />
          <Route
            path="/instructor/courses/:courseId/lessons/:lessonId/edit"
            element={<RoleRoute allowedRoles={['instructor']}><LessonForm /></RoleRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
