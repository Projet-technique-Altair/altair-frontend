import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  Globe,
  ListOrdered,
  Lock,
  Orbit,
  Pencil,
  Sparkles,
} from "lucide-react";

import { getLab } from "@/api/labs";
import { getStarpath, getStarpathLabs } from "@/api/starpaths";
import ReportButton from "@/components/moderation/ReportButton";

type StarpathDifficulty = "beginner" | "intermediate" | "advanced";
type StarpathVisibility = "PRIVATE" | "PUBLIC";

type StarpathRecord = {
  starpath_id: string;
  name: string;
  description?: string | null;
  difficulty?: StarpathDifficulty | string | null;
  visibility?: StarpathVisibility | string | null;
};

type StarpathLabRecord = {
  lab_id: string;
  position?: number;
  name: string;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wide text-white/58">
      {children}
    </div>
  );
}

function DisplayBlock({ children }: { children: ReactNode }) {
  const isEmpty =
    children == null ||
    children === "" ||
    (typeof children === "string" && children.trim() === "");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/85">
      {isEmpty ? <span className="text-white/38">—</span> : children}
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Orbit;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/45">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-medium text-white/86">{value}</div>
    </div>
  );
}

function EmptyStateCard({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
      <div className="text-sm font-semibold text-white/84">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-white/50">{text}</div>
      <button
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/30 hover:bg-white/5"
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
        <span>{actionLabel}</span>
      </button>
    </div>
  );
}

export default function CreatorStarpathDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [starpath, setStarpath] = useState<StarpathRecord | null>(null);
  const [labs, setLabs] = useState<StarpathLabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        navigate("/creator/workspace", { replace: true });
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const [starpathData, starpathLabs] = await Promise.all([
          getStarpath(id),
          getStarpathLabs(id),
        ]);

        const enrichedLabs = await Promise.all(
          (starpathLabs ?? []).map(async (lab: any) => {
            try {
              const fullLab = await getLab(lab.lab_id);
              return {
                ...lab,
                name: fullLab?.name || "Unknown lab",
              } as StarpathLabRecord;
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
              } as StarpathLabRecord;
            }
          }),
        );

        if (cancelled) return;

        const sortedLabs = [...enrichedLabs].sort(
          (left, right) => (left.position ?? 0) - (right.position ?? 0),
        );

        setStarpath(starpathData as StarpathRecord);
        setLabs(sortedLabs);
      } catch (error) {
        console.error("Failed to load starpath details:", error);

        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load starpath details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const difficultyLabel =
    starpath?.difficulty === "beginner"
      ? "Beginner"
      : starpath?.difficulty === "intermediate"
        ? "Intermediate"
        : starpath?.difficulty === "advanced"
          ? "Advanced"
          : "Not set";

  const visibilityLabel =
    starpath?.visibility === "PUBLIC" ? "Public" : "Private";

  const hasLabs = labs.length > 0;
  const visibleLabs = labs.slice(0, 4);

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-white/10" />
            <div className="mt-6 h-3 w-28 rounded bg-white/10" />
            <div className="mt-3 h-10 w-72 rounded bg-white/10" />
            <div className="mt-4 h-5 w-[32rem] max-w-full rounded bg-white/10" />

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-[720px]">
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/5" />
            </div>

            <div className="mt-8 h-px w-full bg-white/10" />

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <div className="h-72 rounded-3xl border border-white/10 bg-white/5" />
              </div>
              <div className="xl:col-span-4">
                <div className="h-96 rounded-3xl border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !starpath) {
    return (
      <div className="min-h-screen w-full text-white">
        <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-8 rounded-3xl border border-red-400/20 bg-red-500/10 p-6">
            <div className="text-base font-semibold text-red-100">
              Failed to load starpath details
            </div>
            <div className="mt-2 text-sm leading-relaxed text-red-200/90">
              {loadError || "This starpath could not be loaded."}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/15"
                type="button"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/creator/workspace")}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/5"
                type="button"
              >
                Return to workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator starpath
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                {starpath.name || "Starpath"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                {starpath.description?.trim() || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill icon={Orbit} label="Labs" value={`${labs.length}`} />
              <SummaryPill icon={Sparkles} label="Difficulty" value={difficultyLabel} />
              <SummaryPill icon={Globe} label="Visibility" value={visibilityLabel} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/starpath/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/86 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.18)]"
              type="button"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit starpath</span>
            </button>

            <button
              onClick={() => navigate(`/creator/starpath/${id}/analytics`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-400/40 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>

            {id ? (
              <ReportButton targetType="starpath" targetId={id} targetLabel={starpath?.name ?? "Starpath"} />
            ) : null}
          </div>

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-white/50">
                    Labs overview
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Preview the first labs attached to this learning path.
                  </div>
                </div>

                {hasLabs && (
                  <button
                    onClick={() => navigate(`/creator/starpath/${id}/edit`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/74 transition hover:border-white/15 hover:bg-white/5"
                    type="button"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Manage</span>
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {!hasLabs ? (
                  <EmptyStateCard
                    title="No labs linked yet"
                    text="This starpath does not have any labs yet. Add labs to define the learning progression."
                    actionLabel="Manage starpath"
                    onAction={() => navigate(`/creator/starpath/${id}/edit`)}
                  />
                ) : (
                  visibleLabs.map((lab, index) => (
                    <div
                      key={lab.lab_id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/45">
                            Lab {typeof lab.position === "number" ? lab.position + 1 : index + 1}
                          </div>
                          <div className="mt-2 text-base font-semibold text-white/90">
                            {lab.name}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-white/45">
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                            Position {typeof lab.position === "number" ? lab.position + 1 : index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {labs.length > visibleLabs.length && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/52">
                    {labs.length - visibleLabs.length} more lab
                    {labs.length - visibleLabs.length > 1 ? "s" : ""} not shown in this preview.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] uppercase tracking-wide text-white/50">
                  Configuration
                </div>

                <button
                  onClick={() => navigate(`/creator/starpath/${id}/edit`)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/74 transition hover:border-white/15 hover:bg-white/5"
                  type="button"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <FieldLabel>Difficulty</FieldLabel>
                  <DisplayBlock>{difficultyLabel}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Visibility</FieldLabel>
                  <DisplayBlock>
                    <div className="flex items-center gap-2">
                      {starpath.visibility === "PUBLIC" ? (
                        <Globe className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Lock className="h-4 w-4 text-white/55" />
                      )}
                      <span>{visibilityLabel}</span>
                    </div>
                  </DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Labs linked</FieldLabel>
                  <DisplayBlock>{labs.length}</DisplayBlock>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
