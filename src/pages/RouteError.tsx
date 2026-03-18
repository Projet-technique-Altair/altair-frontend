/**
 * @file RouteError — global error boundary for route failures.
 *
 * @remarks
 * This component is rendered automatically when a React Router route
 * throws an error during loading, rendering, or data fetching.
 *
 * - Handles both `ErrorResponse` (from loaders/actions) and generic JS errors
 * - Displays status code and message if available
 * - Provides a consistent fallback UI aligned with Altaïr’s theme
 *
 * Route: automatically used as `errorElement` in route definitions.
 *
 * @example
 * ```tsx
 * <Route path="*" element={<NotFound />} errorElement={<RouteError />} />
 * ```
 *
 * @packageDocumentation
 */

import { isRouteErrorResponse, useRouteError } from "react-router-dom";


/**
 * Global error boundary for React Router route errors.
 *
 * @returns JSX layout for displaying error information in a consistent style.
 *
 * @public
 */
export default function RouteError() {
  const error = useRouteError();
  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data || "The requested page could not be found.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D1A] text-white px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-slate-300">{message}</p>
        <a
          href="/"
          className="inline-block mt-6 px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-white/5 
                     hover:bg-white/10 transition backdrop-blur-md text-slate-200 hover:text-white"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
