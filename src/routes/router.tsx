import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// SplashIntro volontairement mis de côté pour plus tard
// import SplashIntro from "@/components/SplashIntro";

import Landing from "@/pages/landing/Landing";
import RouteError from "@/pages/RouteError";

import LearnerLayout from "@/layouts/LearnerLayout";
import CreatorLayout from "@/layouts/CreatorLayout";

import LearnerDashboard from "@/pages/learner/LearnerDashboard";
import LabView from "@/pages/learner/LabView";
import LabSession from "@/pages/learner/LabSession";

import { CreatorDashboard } from "@/pages/creator";
import CreateLabPage from "@/pages/creator/CreateLabPage";
import LabAnalyticsPage from "@/pages/creator/analytics/LabAnalyticsPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuthCallback from "@/pages/AuthCallback";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import AppEntry from "@/pages/AppEntry";

// ===== TOKEN-ONLY GUARD =====
// Redirige vers la landing si non authentifié
/*function AuthGuard() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}*/
function AuthGuard() {
  const { token } = useAuth();
  const storedToken = sessionStorage.getItem("altair_token");
  const effectiveToken = token ?? storedToken;

  if (!effectiveToken) return <Navigate to="/" replace />;
  return <Outlet />;
}


export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      // ================= PUBLIC =================
      {
        path: "/",
        element: <Landing />, // Page de présentation + redirection Keycloak
      },

      // ================= AUTH =================
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },

      // ================= PROTECTED =================
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/app",
            element: <AppEntry />,
          },

          {
            path: "/learner",
            element: (
              <ProtectedRoute allowed={["learner", "creator", "admin"]}>
                <LearnerLayout />
              </ProtectedRoute>
            ),
            errorElement: <RouteError />,
            children: [
              { path: "dashboard", element: <LearnerDashboard /> },
              { path: "labs/:id", element: <LabView /> },
              { path: "labs/:id/session", element: <LabSession /> },
              { index: true, element: <Navigate to="dashboard" replace /> },
            ],
          },

          {
            path: "/creator",
            element: (
              <ProtectedRoute allowed={["creator", "admin"]}>
                <CreatorLayout />
              </ProtectedRoute>
            ),
            children: [
              { path: "dashboard", element: <CreatorDashboard /> },
              { path: "labs/new", element: <CreateLabPage /> },
              { path: "lab/:id", element: <LabAnalyticsPage /> },
            ],
          },

          {
            path: "/admin",
            element: (
              <ProtectedRoute allowed={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // ================= FALLBACK =================
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
