import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // 1. If not logged in, boot them to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but wrong role, send them to an unauthorized page or their own dashboard
  if (!allowedRoles.includes(user.role)) {
    // Fallback routing based on their actual role
    if (user.role === "Admin") return <Navigate to="/admin/users" replace />;
    if (user.role === "Maker")
      return <Navigate to="/maker/dashboard" replace />;
    if (user.role === "Checker")
      return <Navigate to="/checker/dashboard" replace />;
  }

  // 3. If everything checks out, render the child components (the page)
  return <Outlet />;
};

export default ProtectedRoute;
