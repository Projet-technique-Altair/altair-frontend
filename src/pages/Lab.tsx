/**
 * @file LabPage — displays information about a specific lab before launching it.
 *
 * @remarks
 * This view shows a lab’s title, description, difficulty level, and domain.
 * It’s used in the public or learner catalog to preview lab content before
 * launching an ephemeral lab environment.
 *
 * Key features:
 *  - Fetches labs from the mock API (`getLabs`)
 *  - Displays loading skeletons until data is loaded
 *  - Provides navigation back to dashboard or catalog
 *  - "Start Lab" button is currently design-only (placeholder for backend)
 *
 * Route: `/labs/:id`
 *
 * @packageDocumentation
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Lab } from "../api/mock";
import { getLabs } from "../api/mock";


/* === Utility styles and inline subcomponents === */

/** Background gradient for consistent page lighting */
const bgStyle = {
  backgroundImage:
    "radial-gradient(60% 120% at 80% 0%, rgba(122,44,243,0.16) 0%, rgba(11,13,26,0) 60%), radial-gradient(50% 80% at 10% 100%, rgba(42,167,255,0.12) 0%, rgba(11,13,26,0) 55%)",
};

const Button = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-white/5 
               hover:bg-white/10 transition backdrop-blur-md text-slate-200 hover:text-white"
  >
    {children}
  </button>
);

const SkeletonLine = ({ width }: { width: string }) => (
  <div className={`h-4 bg-white/10 rounded ${width} animate-pulse`} />
);


/**
 * Displays a single lab detail page with description, metadata, and
 * an action card to launch the lab environment.
 *
 * @remarks
 * - Uses `useParams` to find the lab by its ID.
 * - Displays skeleton placeholders while fetching data.
 * - The “Start Lab” button is non-functional (mock placeholder).
 *
 * @example
 * ```tsx
 * <Route path="/labs/:id" element={<LabPage />} />
 * ```
 *
 * @returns JSX layout for a lab preview page.
 *
 * @public
 */
export default function LabPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLabs().then((data) => {
      if (!cancelled) {
        setLabs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const lab = useMemo(() => labs.find((l) => l.id === id), [labs, id]);

  if (!loading && !lab) {
    return (
      <div
        className="min-h-screen text-white bg-[#0B0D1A] px-6 py-10 flex flex-col items-center justify-center"
        style={bgStyle}
      >
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Lab not found</h1>
        <p className="text-slate-400 mb-6">
          The requested lab does not exist or was removed.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate(-1)}>← Go back</Button>
          <Link
            to="/catalog"
            className="px-4 py-2 rounded-lg text-sm font-medium
                       bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF7A45]
                       shadow-[0_6px_20px_rgba(122,44,243,0.35)]
                       hover:shadow-[0_8px_25px_rgba(122,44,243,0.5)] transition"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-[#0B0D1A] px-6 py-8" style={bgStyle}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {loading ? (
            <span className="inline-block h-6 w-56 bg-white/10 rounded animate-pulse" />
          ) : (
            lab?.name
          )}
        </h1>

        <div className="ml-auto flex items-center gap-3">
          <Link to="/catalog">
            <Button>← Back to Catalog</Button>
          </Link>
          <Button onClick={() => navigate("/dashboard")}>← Back to Dashboard</Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: description + meta */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur 
                        shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-6">
          <div className="space-y-3 text-sm text-slate-300">
            {loading ? (
              <>
                <SkeletonLine width="w-11/12" />
                <SkeletonLine width="w-9/12" />
                <SkeletonLine width="w-6/12" />
              </>
            ) : (
              lab?.description
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                (lab?.level ?? "Beginner") === "Beginner"
                  ? "bg-green-500/20 text-green-300"
                  : (lab?.level ?? "Intermediate") === "Intermediate"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              {loading ? "Level" : lab?.level}
            </span>
            <span className="text-xs px-2 py-1 rounded font-medium bg-white/10 text-slate-200">
              {loading ? "Duration — …" : "Duration — ~30 min"}
            </span>
            <span className="text-xs px-2 py-1 rounded font-medium bg-white/10 text-slate-200">
              {loading ? "Category — …" : `Category — ${lab?.domain}`}
            </span>
          </div>

          <div className="mt-6">
            <div className="text-sm text-slate-300 mb-3 font-medium">
              What you will do
            </div>
            <ol className="space-y-2 text-sm text-slate-300 list-decimal ml-5">
              {loading ? (
                <>
                  <SkeletonLine width="w-10/12" />
                  <SkeletonLine width="w-8/12" />
                  <SkeletonLine width="w-7/12" />
                </>
              ) : (
                <>
                  <li>Connect to an ephemeral environment.</li>
                  <li>Run basic commands and explore the filesystem.</li>
                  <li>Submit your result and get instant feedback.</li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Right: action card */}
        <div className="rounded-2xl border border-white/10 bg-[#121628]/80 backdrop-blur 
                        shadow-[0_18px_50px_rgba(0,0,0,0.35)] p-6 h-max">
          <div className="font-medium mb-2">Ready to start?</div>
          <p className="text-sm text-slate-300">
            Launch an isolated environment for this lab. It will auto-expire.
          </p>

          <button
            className="mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium
                       bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF7A45]
                       shadow-[0_8px_24px_rgba(122,44,243,0.35)] hover:shadow-[0_10px_30px_rgba(122,44,243,0.5)]
                       transition"
            onClick={() => alert('Design-only: would start lab instance')}
          >
            Start Lab
          </button>

          <div className="mt-6 text-xs text-slate-400 space-y-1">
            <div>• Ephemeral environment (TTL 2h)</div>
            <div>• No public IP, secure access via proxy</div>
            <div>• Files saved to your submissions</div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Link
              to="/catalog"
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-200 hover:text-white"
            >
              Browse more labs
            </Link>
            <Link
              to="/dashboard"
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-200 hover:text-white"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
