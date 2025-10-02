import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const loc = useLocation();
  if (!user || !token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}
