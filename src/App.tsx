/**
 * @file App.tsx — simplified router setup for demo or lightweight environments.
 *
 * @remarks
 * This version uses React Router’s <Routes> / <Route> without layouts or guards,
 * ideal for quick demos, internal testing, or early integration stages.
 *
 * Includes:
 *  - Login page at `/`
 *  - Separate dashboards for learners and creators
 *  - Placeholder pages for catalog, labs, and teacher console
 *  - Fallback route redirecting all unknown paths to `/`
 *
 * @packageDocumentation
 */

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardStudent from "./pages/learner/LearnerDashboard";
import DashboardTeacher from "./pages/creator/CreatorDashboard";

// === PLACEHOLDER PAGES ===
/**
 * Placeholder for the lab catalog.
 */
function Catalog() { return <div className="p-6 text-white">Catalog (coming soon)</div>; }
function MyLabs() { return <div className="p-6 text-white">My Labs (coming soon)</div>; }
function TeacherConsole() { return <div className="p-6 text-white">Teacher Console (coming soon)</div>; }


/**
 * Root-level router for the minimal app version.
 *
 * @returns JSX structure containing all routes.
 *
 * @example
 * ```tsx
 * import { BrowserRouter } from "react-router-dom";
 * import App from "./App";
 *
 * export default function Root() {
 *   return (
 *     <BrowserRouter>
 *       <App />
 *     </BrowserRouter>
 *   );
 * }
 * ```
 */
export default function App() {
  return (
    <Routes>
      {/* === AUTH === */}
      <Route path="/" element={<Login />} />

      {/* === LEARNER AND CREATOR DASHBOARD === */}
      <Route path="/dashboard-student" element={<DashboardStudent />} />
      <Route path="/dashboard" element={<DashboardTeacher />} />

      {/* === PLACEHOLDER ROUTES === */}
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/lab" element={<MyLabs />} />
      <Route path="/teacher" element={<TeacherConsole />} />

      {/* === FALLBACK === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
