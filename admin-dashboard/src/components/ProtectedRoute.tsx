import React, { ReactNode } from 'react';
import { Navigate, Outlet, Location } from 'react-router-dom';
import TokenManager from '../services/TokenManager';

interface ProtectedRouteProps {
  children?: ReactNode;
}

let ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (TokenManager.getTokens().access) {
    return <Outlet />; 
  } else {
    return <Navigate to="/login" replace />; 
  }
};

export default ProtectedRoute;
