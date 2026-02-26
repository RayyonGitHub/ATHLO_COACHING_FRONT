import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  if (userStr) {
    try { user = JSON.parse(userStr); } catch (e) {}
  }

  // Si pas de token ou si le rôle n'est pas admin => Dehors
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;