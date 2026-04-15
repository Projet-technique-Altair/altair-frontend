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
import LearnerExplorer from "@/pages/learner/LearnerExplorer";
import ProfilePage from "@/pages/learner/ProfilePage";
import SettingsPage from "@/pages/learner/SettingsPage";
import GachaPage from "@/pages/gamification/GachaPage";
import MarketplacePage from "@/pages/gamification/MarketplacePage";
import CollectionPage from "@/pages/gamification/CollectionPage";

import { CreatorDashboard, CreatorWorkspace } from "@/pages/creator";
import CreateLabPage from "@/pages/creator/labs/CreateLabPage";
import CreateStepPage from "@/pages/creator/labs/CreateStepPage";
import CreateGroupPage from "@/pages/creator/groups/CreateGroupPage";
import CreatorGroupDetailsPage from "@/pages/creator/groups/CreatorGroupDetails";
import CreatorGroupEditPage from "@/pages/creator/groups/CreatorGroupEditPage";
import CreatorLabDetails from "@/pages/creator/labs/CreatorLabDetails";
import CreatorLabEditPage from "@/pages/creator/labs/CreatorLabEditPage";
import LabAnalyticsPage from "@/pages/creator/analytics/LabAnalyticsPage";
import GroupAnalyticsPage from "@/pages/creator/analytics/GroupAnalyticsPage";
import StarpathAnalyticsPage from "@/pages/creator/analytics/StarpathAnalyticsPage";
import CreateStarpathPage from "@/pages/creator/starpaths/CreateStarpathPage";
import CreatorStarpathDetailsPage from "@/pages/creator/starpaths/CreatorStarpathDetails";
import CreatorStarpathEditPage from "@/pages/creator/starpaths/CreatorStarpathEditPage";

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
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/app",
            element: <AppEntry />,
            errorElement: null,
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
            path: "/creator",
            element: (
              <ProtectedRoute allowed={["creator", "admin"]}>
                <CreatorLayout />
              </ProtectedRoute>
            ),
            children: [
              { path: "dashboard", element: <CreatorDashboard /> },
              { path: "workspace", element: <CreatorWorkspace /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "settings", element: <SettingsPage /> },

              { path: "gacha", element: <GachaPage /> },
              { path: "marketplace", element: <MarketplacePage /> },
              { path: "collection", element: <CollectionPage /> },

              { path: "labs/new", element: <CreateLabPage /> },
              { path: "lab/:id", element: <CreatorLabDetails /> },
              { path: "lab/:id/edit", element: <CreatorLabEditPage /> },
              { path: "lab/:id/steps", element: <CreateStepPage /> },
              { path: "lab/:id/analytics", element: <LabAnalyticsPage /> },

              { path: "groups/new", element: <CreateGroupPage /> },
              { path: "group/:id", element: <CreatorGroupDetailsPage /> },
              { path: "group/:id/edit", element: <CreatorGroupEditPage /> },
              { path: "group/:id/analytics", element: <GroupAnalyticsPage /> },

              { path: "starpaths/new", element: <CreateStarpathPage /> },
              { path: "starpath/:id", element: <CreatorStarpathDetailsPage /> },
              { path: "starpath/:id/edit", element: <CreatorStarpathEditPage /> },
              { path: "starpath/:id/analytics", element: <StarpathAnalyticsPage /> },

              { index: true, element: <Navigate to="dashboard" replace /> },
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

      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
