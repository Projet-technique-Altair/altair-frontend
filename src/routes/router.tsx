// src/routes/router.tsx

/**
 * @file router.tsx — global route configuration for the Altaïr platform.
 *
 * @remarks
 * Defines all public, learner, creator, and admin routes using React Router v6.
 * 
 * Includes:
 *  - Nested layouts with <Outlet />
 *  - Route guards for protected areas
 *  - Custom error boundaries (RouteError)
 *  - Redirects for default and fallback routes
 *
 * @packageDocumentation
 */
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import LearnerLayout from "@/layouts/LearnerLayout";
import CreatorLayout from "@/layouts/CreatorLayout";
import SplashIntro from "@/components/SplashIntro";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import LearnerDashboard from "@/pages/learner/LearnerDashboard";
import LearnerExplorer from "@/pages/learner/LearnerExplorer";
import LabView from "@/pages/learner/LabView";
import LabSession from "@/pages/learner/LabSession";
import StarpathView from "@/pages/learner/StarpathView";
import ProfilePage from "@/pages/learner/ProfilePage";
import SettingsPage from "@/pages/learner/SettingsPage";
import RouteError from "@/pages/RouteError";

import { CreatorDashboard } from "@/pages/creator";
import CreateLabPage from "@/pages/creator/CreateLabPage";
import CreateStarpathPage from "@/pages/creator/CreateStarpathPage";
import LabAnalyticsPage from "@/pages/creator/analytics/LabAnalyticsPage";
import StarpathAnalyticsPage from "@/pages/creator/analytics/StarpathAnalyticsPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";


/**
 * Role-based route protection for creator-only areas.
 *
 * @remarks
 * Redirects to login if unauthenticated,
 * or to learner settings if user is not a creator.
 */
function CreatorGuard() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "creator") return <Navigate to="/learner/settings" replace />;
  return <Outlet />;
}

function DisabledRouteAuth() {
  return <Navigate to="/login" replace />;
}

//{ path: "/register", element: <Register /> }

function DisabledRouteLearner() {
  return <Navigate to="/learner/dashboard" replace />;
}

          /*{ path: "explorer", element: <LearnerExplorer /> },
          { path: "labs/:id", element: <LabView /> },
          { path: "labs/:id/session", element: <LabSession /> },
          { path: "starpath/:id", element: <StarpathView /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "settings", element: <SettingsPage /> },
          { index: true, element: <Navigate to="dashboard" replace /> }*/


function DisabledRouteCreator() {
  return <Navigate to="/creator/dashboard" replace />;
}

            /*{ path: "dashboard", element: <CreatorDashboard /> },
              { path: "labs/new", element: <CreateLabPage /> },
              { path: "starpaths/new", element: <CreateStarpathPage /> },
              { path: "lab/:id", element: <LabAnalyticsPage /> },
              { path: "starpath/:id", element: <StarpathAnalyticsPage /> },*/

/**
 * Global application router definition.
 *
 * @remarks
 * All routes are wrapped in the `AuthProvider` to share authentication context globally.
 * 
 * Includes:
 *  - `/learner/...` — student experience
 *  - `/creator/...` — creator workspace
 *  - `/admin` — isolated admin dashboard
 *  - `/` — splash intro
 *  - `/login` / `/register` — authentication flow
 *
 * @example
 * ```tsx
 * import { RouterProvider } from "react-router-dom";
 * import { router } from "@/routes/router";
 *
 * export default function App() {
 *   return <RouterProvider router={router} />;
 * }
 * ```
 *
 * @public
 */
export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      // === SPLASH ===
      { path: "/", element: <SplashIntro /> },

      // === AUTH ===
      { path: "/login", element: <Login /> },
      { path: "/register", element: <DisabledRouteAuth /> },

      // === LEARNER AREA ===
      {
        path: "/learner",
        element: <LearnerLayout />,
        errorElement: <RouteError />,
        children: [
          { path: "dashboard", element: <LearnerDashboard /> },
          { path: "explorer", element: <DisabledRouteLearner /> },
          { path: "labs/:id", element: <LabView /> },
          { path: "labs/:id/session", element: <LabSession /> },
          { path: "starpath/:id", element: <DisabledRouteLearner /> },
          { path: "profile", element: <DisabledRouteLearner /> },
          { path: "settings", element: <DisabledRouteLearner /> },
          { index: true, element: <Navigate to="dashboard" replace /> },
        ],
      },

      // === CREATOR AREA ===
      {
        path: "/creator",
        element: <CreatorGuard />,
        children: [
          {
            element: <CreatorLayout />,
            children: [
              { path: "dashboard", element: <CreatorDashboard /> },
              { path: "labs/new", element: <CreateLabPage /> },
              { path: "starpaths/new", element: <DisabledRouteCreator /> },
              { path: "lab/:id", element: <LabAnalyticsPage /> },
              { path: "starpath/:id", element: <DisabledRouteCreator /> },
            ],
          },
        ],
      },

      // === ADMIN AREA (isolated) ===
      {
        path: "/admin",
        element: <AdminDashboard />,
      },
      
      // === FALLBACK ===
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
