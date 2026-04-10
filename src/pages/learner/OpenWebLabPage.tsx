import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { getSession, openWebLabSession } from "@/api/sessions";

function clearStoredSessionId(labId: string) {
  sessionStorage.removeItem(`altair_session_${labId}`);
}

export default function OpenWebLabPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!sessionId) {
        if (!cancelled) setError("Missing session id.");
        return;
      }

      try {
        const result = await openWebLabSession(sessionId);
        if (cancelled) return;

        if (!result?.redirect_url) {
          setError("Missing redirect_url from backend.");
          return;
        }

        window.location.replace(result.redirect_url);
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && sessionId) {
          try {
            // A stale cached session should send the learner back to the lab page
            // so the normal start/resume flow can create a fresh runtime.
            const session = await getSession(sessionId);
            if (cancelled) return;

            if (session?.lab_id) {
              clearStoredSessionId(session.lab_id);
              navigate(`/learner/labs/${session.lab_id}/session`, { replace: true });
              return;
            }
          } catch {
            // Fallback to the generic error below if the stale session cannot be reloaded.
          }
        }

        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to open web lab.");
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#090E19] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0E1323] p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Open Web Lab</h1>
        {error ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-red-300">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => navigate("/learner/dashboard")}
                className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-300">
              Preparing the browser session for this web lab.
            </p>
            <p className="text-xs text-slate-500">You will be redirected automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
