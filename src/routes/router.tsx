import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Landing from "@/pages/landing/Landing";
import RouteError from "@/pages/RouteError";

import LearnerLayout from "@/layouts/LearnerLayout";
import CreatorLayout from "@/layouts/CreatorLayout";

import LearnerDashboard from "@/pages/learner/LearnerDashboard";
import GroupsView from "@/pages/learner/GroupsView";
import StarpathView from "@/pages/learner/StarpathView";
import LabView from "@/pages/learner/LabView";
import LabSession from "@/pages/learner/LabSession";
import OpenWebLabPage from "@/pages/learner/OpenWebLabPage";
import LearnerExplorer from "@/pages/learner/LearnerExplorer";
import ProfilePage from "@/pages/learner/ProfilePage";
import SettingsPage from "@/pages/learner/SettingsPage";
import GachaPage from "@/pages/gamification/GachaPage";
import MarketplacePage from "@/pages/gamification/MarketplacePage";
import CollectionPage from "@/pages/gamification/CollectionPage";

import { CreatorDashboard, CreatorWorkspace } from "@/pages/creator";
import CreateLabPage from "@/pages/creator/CreateLabPage";
import CreateStepPage from "@/pages/creator/CreateStepPage";
import CreateGroupPage from "@/pages/creator/CreateGroupPage";
import CreatorGroupPage from "@/pages/creator/CreatorGroupPage";
import CreatorLabDetails from "@/pages/creator/CreatorLabDetails";
import CreatorLabEditPage from "@/pages/creator/CreatorLabEditPage";
import LabAnalyticsPage from "@/pages/creator/analytics/LabAnalyticsPage";
import CreateStarpathPage from "@/pages/creator/CreateStarpathPage";
import CreatorStarpathPage from "@/pages/creator/CreatorStarpathPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuthCallback from "@/pages/AuthCallback";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import AppEntry from "@/pages/AppEntry";
import AuthGuard from "@/routes/AuthGuard";

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
        element: <Landing />,
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
            errorElement: null,
          },

          // ================= LEARNER =================
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
              { path: "explorer", element: <LearnerExplorer /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "gacha", element: <GachaPage /> },
              { path: "marketplace", element: <MarketplacePage /> },
              { path: "collection", element: <CollectionPage /> },

              { path: "groups", element: <GroupsView /> },
              { path: "groups/:id", element: <GroupsView /> },

              { path: "starpaths", element: <StarpathView /> },
              { path: "starpaths/:id", element: <StarpathView /> },

              { path: "labs/:id", element: <LabView /> },
              { path: "labs/:id/session", element: <LabSession /> },

              { index: true, element: <Navigate to="dashboard" replace /> },
            ],
          },

          {
            path: "/learner/sessions/:sessionId/open-web-lab",
            element: (
              <ProtectedRoute allowed={["learner", "creator", "admin"]}>
                <OpenWebLabPage />
              </ProtectedRoute>
            ),
            errorElement: <RouteError />,
          },

          // ================= CREATOR =================
          {
            path: "/creator",
            element: (
              <ProtectedRoute allowed={["creator", "admin"]}>
                <CreatorLayout />
              </ProtectedRoute>
            ),
            children: [
              /* ===== CORE ===== */
              { path: "dashboard", element: <CreatorDashboard /> },

              // 🔥 NEW WORKSPACE
              { path: "workspace", element: <CreatorWorkspace /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "settings", element: <SettingsPage /> },

              /* ===== GAMIFICATION (mirror learner) ===== */
              { path: "gacha", element: <GachaPage /> },
              { path: "marketplace", element: <MarketplacePage /> },
              { path: "collection", element: <CollectionPage /> },

              /* ===== LABS ===== */
              { path: "labs/new", element: <CreateLabPage /> },
              { path: "lab/:id", element: <CreatorLabDetails /> },
              { path: "lab/:id/edit", element: <CreatorLabEditPage /> },
              { path: "labs/:id/steps", element: <CreateStepPage /> },
              { path: "lab/:id/analytics", element: <LabAnalyticsPage /> },

              /* ===== GROUPS ===== */
              { path: "groups/new", element: <CreateGroupPage /> },
              { path: "group/:id", element: <CreatorGroupPage /> },

              /* ===== STARPATHS ===== */
              { path: "starpaths/new", element: <CreateStarpathPage /> },
              { path: "starpath/:id", element: <CreatorStarpathPage /> },

              /* ===== DEFAULT ===== */
              { index: true, element: <Navigate to="dashboard" replace /> },
            ],
          },

          // ================= ADMIN =================
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
