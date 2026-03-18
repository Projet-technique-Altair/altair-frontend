import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function AuthGuard() {
  const { token } = useAuth();
  const storedToken = sessionStorage.getItem("altair_token");
  const effectiveToken = token ?? storedToken;

  if (!effectiveToken) return <Navigate to="/" replace />;
  return <Outlet />;
}
