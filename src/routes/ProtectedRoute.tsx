/*import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";
import { routeForRole } from "@/lib/roleRouting";



type Props = {
  allowed: UserRole[];
  children: React.ReactElement;
};

export function ProtectedRoute({ allowed, children }: Props) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to={routeForRole(user.role)} replace />;
  }

  return children;
}
*/

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type Props = {
  // on garde allowed pour compat, mais on ne s'en sert plus côté front
  allowed?: string[];
  children: React.ReactElement;
};

export function ProtectedRoute({ children }: Props) {
  const { token } = useAuth();
  const location = useLocation();

  const effectiveToken = token ?? sessionStorage.getItem("altair_token");

  if (!effectiveToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}
