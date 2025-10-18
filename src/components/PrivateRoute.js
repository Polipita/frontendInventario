import React from 'react';  
import { Navigate } from 'react-router-dom';  
import { useAuth } from '../contexts/AuthContext';  

const PrivateRoute = ({ children, adminOnly = false }) => {  
  const { token, role } = useAuth();  

  if (!token) {  
    return <Navigate to="/login" replace />;  
  }  

  if (adminOnly && role !== 'admin') {  
    return <Navigate to="/dashboard" replace />;  
  }  

  return children;  
};  

export default PrivateRoute;