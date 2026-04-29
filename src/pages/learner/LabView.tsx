import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Rocket,
  Signal,
  Timer,
} from "lucide-react";

import { ApiError } from "@/api/client";
import { getLab } from "@/api/labs";
import {
  followLab,
  getLearnerDashboardLabs,
  type LearnerDashboardLab,
  type LearnerLabStatus,
  unfollowLab,
} from "@/api/sessions";
import ReportButton from "@/components/moderation/ReportButton";
import type { Lab } from "@/contracts/labs";

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
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${klass}`}
    >
      {d || "UNKNOWN"}
    </span>
  );
}

export default function LabView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();

  const mockUI = useMemo(
    () => new URLSearchParams(search).get("mock") === "1",
    [search],
  );

  const [lab, setLab] = useState<LabViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learnerStatus, setLearnerStatus] = useState<LearnerLabStatus | null>(
    null,
  );
  const [followPending, setFollowPending] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [followAvailable, setFollowAvailable] = useState(true);

  useEffect(() => {
    if (!id) return;

    if (mockUI) {
      setLab(mockLabFromId(id));
      setLearnerStatus(null);
      setFollowAvailable(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setFollowError(null);
    setFollowAvailable(true);

    Promise.allSettled([getLab(id), getLearnerDashboardLabs()])
      .then(([labResult, learnerLabsResult]) => {
        if (labResult.status === "rejected") {
          throw labResult.reason;
        }

        setLab(mapLabToViewModel(labResult.value));

        if (learnerLabsResult.status === "fulfilled") {
          const matched = (
            learnerLabsResult.value as LearnerDashboardLab[]
          ).find((entry) => entry.lab_id === id);
          setLearnerStatus(matched?.status ?? null);
        } else {
          if (
            learnerLabsResult.reason instanceof ApiError &&
            learnerLabsResult.reason.status === 403
          ) {
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
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/25 bg-sky-500/15 px-2 py-1 text-[10px] font-semibold text-sky-300">
          <Rocket className="h-3.5 w-3.5" />
          IN PROGRESS
        </span>
      );
    }

    if (status === "FINISHED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-400/25 bg-green-500/15 px-2 py-1 text-[10px] font-semibold text-green-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          FINISHED
        </span>
      );
    }

    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        Loading lab...
      </div>
    );
  }

  if (error || !lab) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="text-sm uppercase tracking-wide text-white/55">
            Error
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-white/90">
            Lab not found
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80 transition hover:border-white/15 hover:bg-white/5"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const overviewText = lab.story ?? lab.description;
  const objectives = splitBriefingText(lab.objectives);

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Lab
          </div>

          <h1
            className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl"
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

          {!lab.mock ? (
            <div className="mt-5">
              <ReportButton targetType="lab" targetId={lab.id} targetLabel={lab.name} />
            </div>
          ) : null}

          {followError && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {followError}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Overview
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/78">
                {overviewText}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Objectives
              </div>

              {objectives.length > 0 ? (
                <ul className="mt-4 space-y-3 text-sm text-white/78">
                  {objectives.map((objective) => (
                    <li key={objective} className="flex gap-3 leading-relaxed">
                      <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-white/78">
                  No objectives provided.
                </p>
              )}
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Launch
              </div>

               <div className="pt-2">
                  <button
                    onClick={() => navigate(`/learner/labs/${lab.id}/session`)}
                    className="
      inline-flex w-full items-center justify-center gap-2
      rounded-2xl border border-white/10
      bg-black/20 px-4 py-3 text-sm font-semibold text-white/85
      transition
      hover:bg-white/5 hover:border-sky-400/40
      hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]
      active:scale-[0.98]
    "
                    type="button"
                  >
                    <Play className="h-4 w-4" />
                    Start Lab
                  </button>
                </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Estimated time
                  </div>
                  <div className="mt-1.5 text-sm text-white/85">
                    {lab.estimatedTime}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Difficulty
                  </div>
                  <div className="mt-2">
                    <DifficultyPill difficulty={lab.difficulty} />
                  </div>
                </div>

                {(learnerStatus === "IN_PROGRESS" ||
                  learnerStatus === "FINISHED") && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/50">
                      Status
                    </div>
                    <div className="mt-2">
                      {renderLearnerMarker(learnerStatus)}
                    </div>
                  </div>
                )}

               

                {followAvailable &&
                  (learnerStatus === null || learnerStatus === "TODO") && (
                    <button
                      onClick={() => void handleToggleFollow()}
                      disabled={followPending}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        learnerStatus === "TODO"
                          ? "border-orange-300/25 bg-orange-500/15 text-orange-100 hover:bg-orange-500/20"
                          : "border-white/10 bg-black/20 text-white/80 hover:border-white/15 hover:bg-white/5"
                      } ${followPending ? "cursor-not-allowed opacity-60" : ""}`}
                      type="button"
                    >
                      {followPending
                        ? "..."
                        : learnerStatus === "TODO"
                          ? "Following"
                          : "Follow"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
