import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, booting } = useAuth();
  if (booting) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
