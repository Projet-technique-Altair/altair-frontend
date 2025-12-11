/**
 * @file NotFound — global 404 fallback page.
 *
 * @remarks
 * This component is displayed whenever a route does not match any known path.
 * It provides a clean fallback experience that:
 *
 *  - Informs the user that the page was not found
 *  - Suggests returning to the login screen
 *  - Uses Altaïr’s dark theme with consistent typography
 *
 * Route: fallback (`*`)
 *
 * @packageDocumentation
 */

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0D1A] text-white px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">404 — Not Found</h1>
        <p className="mt-2 text-slate-300">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-white/5 
                       hover:bg-white/10 transition backdrop-blur-md text-slate-200 hover:text-white"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
