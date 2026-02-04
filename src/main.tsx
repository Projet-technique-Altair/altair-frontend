// src/main.tsx

/**
 * @file main.tsx — Application entry point.
 *
 * @remarks
 * Bootstraps the React app, initializes the router, and mounts the root component.
 * This file is automatically loaded by Vite.
 *
 * Includes:
 *  - React.StrictMode for highlighting potential side effects in development.
 *  - Global CSS import (Tailwind, custom utilities, etc.).
 *  - RouterProvider using the `router` configuration from /src/routes/router.tsx.
 *
 * @packageDocumentation
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/router";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
