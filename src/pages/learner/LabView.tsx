import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Play, Rocket, Signal, Timer } from "lucide-react";

import { ApiError } from "@/api/client";
import { getLab } from "@/api/labs";
import {
  followLab,
  getLearnerDashboardLabs,
  type LearnerDashboardLab,
  type LearnerLabStatus,
  unfollowLab,
} from "@/api/sessions";
import type { Lab } from "@/contracts/labs";
import { ALT_COLORS } from "@/lib/theme";

/**
 * UI projection of a Lab.
 * We keep it minimal and honest to backend data.
 */
interface LabViewModel {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  story: string | null;
  objectives: string | null;
  // UI-only
  mock?: boolean;
}

function mapLabToViewModel(raw: Lab): LabViewModel {
  return {
    id: raw.lab_id,
    name: raw.name,
    description: raw.description ?? "No description available.",
    difficulty: raw.difficulty ?? "Unknown",
    estimatedTime: raw.estimated_duration ?? "Unknown duration",
    story: raw.story ?? null,
    objectives: raw.objectives ?? null,
  };
}

function mockLabFromId(id: string): LabViewModel {
  const isCompleted = id.includes("completed");
  const isInProgress = id.includes("progress") || id.includes("in-progress");

  return {
    id,
    name: isCompleted
      ? "Mock Lab — Completed"
      : isInProgress
        ? "Lab — In Progress"
        : "Mock Lab — Preview",
    description:
      "This is mock data to validate UI. Backend is bypassed when ?mock=1 is present.",
    difficulty: isCompleted ? "BEGINNER" : "INTERMEDIATE",
    estimatedTime: isCompleted ? "25 min" : "45 min",
    story:
      "A short mock narrative used to validate the learner briefing layout before backend content is fully wired.",
    objectives:
      "Understand the environment\nIdentify the main target\nComplete the expected task",
    mock: true,
  };
}

function splitBriefingText(value: string | null | undefined): string[] {
  if (!value) return [];

  return value
    .split(/\r?\n|•|-/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
  const d = (difficulty || "").toUpperCase();

  const klass =
    d === "BEGINNER"
      ? "bg-emerald-400/10 text-emerald-200 border-emerald-300/15"
      : d === "INTERMEDIATE"
        ? "bg-amber-400/10 text-amber-200 border-amber-300/15"
        : d === "ADVANCED"
          ? "bg-rose-400/10 text-rose-200 border-rose-300/15"
          : "bg-white/5 text-white/70 border-white/10";

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${klass}`}>
      {d || "UNKNOWN"}
    </span>
  );
}

export default function LabView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();

  const mockUI = useMemo(() => new URLSearchParams(search).get("mock") === "1", [search]);

  const [lab, setLab] = useState<LabViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learnerStatus, setLearnerStatus] = useState<LearnerLabStatus | null>(null);
  const [followPending, setFollowPending] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [followAvailable, setFollowAvailable] = useState(true);

  useEffect(() => {
    if (!id) return;

    // ✅ MOCK MODE: skip backend
    if (mockUI) {
      setLab(mockLabFromId(id));
      setLearnerStatus(null);
      setFollowAvailable(false);
      setLoading(false);
      setError(null);
      return;
    }

    // normal mode (backend)
    setLoading(true);
    setError(null);
    setFollowError(null);
    setFollowAvailable(true);

    // The lab detail must stay readable even when learner-only endpoints are unavailable for the
    // current account, so the learner status request is intentionally non-blocking.
    Promise.allSettled([getLab(id), getLearnerDashboardLabs()])
      .then(([labResult, learnerLabsResult]) => {
        if (labResult.status === "rejected") {
          throw labResult.reason;
        }

        setLab(mapLabToViewModel(labResult.value));

        if (learnerLabsResult.status === "fulfilled") {
          const matched = (learnerLabsResult.value as LearnerDashboardLab[]).find(
            (entry) => entry.lab_id === id
          );
          setLearnerStatus(matched?.status ?? null);
        } else {
          // A 403 here usually means the account is not a learner. The lab page should still render.
          if (learnerLabsResult.reason instanceof ApiError && learnerLabsResult.reason.status === 403) {
            setFollowAvailable(false);
          }
          setLearnerStatus(null);
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Lab not found");
        setLoading(false);
      });
  }, [id, mockUI]);

  async function handleToggleFollow() {
    if (!lab || followPending) return;
    // Once a lab is started or finished, follow is no longer the right control surface.
    if (learnerStatus === "IN_PROGRESS" || learnerStatus === "FINISHED") return;

    setFollowPending(true);
    setFollowError(null);

    try {
      if (learnerStatus === "TODO") {
        await unfollowLab(lab.id);
        setLearnerStatus(null);
      } else {
        await followLab(lab.id);
        setLearnerStatus("TODO");
      }
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError && err.status === 403) {
        // If the backend rejects the action as non-learner, remove the CTA instead of leaving a
        // broken button on screen.
        setFollowAvailable(false);
        setFollowError("Follow is only available for learner accounts");
      } else {
        setFollowError("Failed to update followed lab state");
      }
    } finally {
      setFollowPending(false);
    }
  }

  function renderLearnerMarker(status: LearnerLabStatus | null) {
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/25 px-2 py-1 text-[10px] font-semibold">
          <Rocket className="h-3.5 w-3.5" />
          IN PROGRESS
        </span>
      );
    }

    if (status === "FINISHED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 text-green-300 border border-green-400/25 px-2 py-1 text-[10px] font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          FINISHED
        </span>
      );
    }

    return null;
  }

  // ===== UI Helpers
  const headerGradient = useMemo(
    () => `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
    []
  );

  // ===== Loading / Error
  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] px-8 py-6">
          <div className="text-white/70 animate-pulse">Loading lab…</div>
        </div>
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="min-h-[70vh] w-full flex items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] p-8 text-center">
          <div className="text-sm uppercase tracking-wide text-white/55">Error</div>
          <h1 className="mt-2 text-2xl font-semibold text-white/90">Lab not found</h1>

          <button
            onClick={() => navigate("/learner/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:border-white/15 transition"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    // ✅ Background is owned by LearnerLayout (transparent here)
    <div className="min-h-screen w-full text-white">
      <div className="w-full px-8 2xl:px-12 py-12 space-y-8">
        {/* ===== HEADER PANEL ===== */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_90px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="relative p-8">
            {/* glow */}
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
              <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/5 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="text-[11px] tracking-wide uppercase text-white/55">
                    Lab
                  </div>

                  <h1
                    className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight truncate"
                    style={{
                      background: headerGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    title={lab.name}
                  >
                    {lab.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <DifficultyPill difficulty={lab.difficulty} />
                    {renderLearnerMarker(learnerStatus)}

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px]">
                      <Timer className="h-3.5 w-3.5 text-white/55" />
                      {lab.estimatedTime}
                    </span>

                    {lab.mock && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px]">
                        <Signal className="h-3.5 w-3.5 text-white/55" />
                        mock mode
                      </span>
                    )}
                  </div>
                </div>

                {/* action cluster */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* The detail page follows the same follow rules as the explorer. */}
                  {followAvailable && (learnerStatus === null || learnerStatus === "TODO") && (
                    <button
                      onClick={() => void handleToggleFollow()}
                      disabled={followPending}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold border transition ${
                        learnerStatus === "TODO"
                          ? "border-orange-300/25 bg-orange-500/15 text-orange-100 hover:bg-orange-500/20"
                          : "border-white/10 bg-black/20 text-white/80 hover:bg-white/5 hover:border-white/15"
                      } ${followPending ? "opacity-60 cursor-not-allowed" : ""}`}
                      type="button"
                    >
                      {followPending ? "..." : learnerStatus === "TODO" ? "Following" : "Follow"}
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/learner/labs/${lab.id}/session`)}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white
                               bg-gradient-to-r from-sky-400/90 via-purple-400/90 to-orange-300/85
                               hover:opacity-90 transition shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
                    type="button"
                  >
                    <Play className="h-4 w-4" />
                    Start Lab
                  </button>

                  <button
                    onClick={() => navigate("/learner/dashboard")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:border-white/15 transition"
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>
              </div>

              {followError && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {followError}
                </div>
              )}

              {/* short description preview */}
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-6">
                <div className="text-[11px] uppercase tracking-wide text-white/55">
                  Briefing
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Story
                    </div>
                    <p className="mt-2 text-sm text-white/75 leading-relaxed">
                      {lab.story ?? lab.description}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Objectives
                    </div>
                    {splitBriefingText(lab.objectives).length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm text-white/75">
                        {splitBriefingText(lab.objectives).map((objective) => (
                          <li key={objective} className="flex gap-2 leading-relaxed">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-white/75 leading-relaxed">
                        No objectives provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* optional: “coming soon” social tease, but NO likes/comments */}
              <div className="mt-6 text-[11px] text-white/45">
                Community layer (likes/comments) will be added later — not enabled in this MVP.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
