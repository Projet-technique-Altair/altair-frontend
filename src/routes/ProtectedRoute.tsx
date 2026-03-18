import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

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
