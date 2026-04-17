// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';

/**
 * Wraps admin pages — redirects to /admin/login if no token found.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
