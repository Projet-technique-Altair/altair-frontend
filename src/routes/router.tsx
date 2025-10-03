// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import SplashIntro from "../components/SplashIntro";
import Login from "../pages/Login";

export const router = createBrowserRouter([
  { path: "/", element: <SplashIntro /> },
  { path: "/login", element: <Login /> },
]);
