
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../api/auth';

export default function ProtectedRoute({ children }) {
  const adminLoggedIn = isLoggedIn();

  if (!adminLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

