import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Catalog from "../pages/Catalog";
import Lab from "../pages/Lab";
import Dashboard from "../pages/Dashboard";
import TeacherConsole from "../pages/TeacherConsole";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Catalog /> },
      { path: "labs/:id", element: <Lab /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "teacher", element: <TeacherConsole /> },
    ],
  },
]);
