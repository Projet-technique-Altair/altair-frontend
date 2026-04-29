import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  FileCode2,
  Globe,
  ListOrdered,
  Lock,
  Pencil,
  TerminalSquare,
} from "lucide-react";

import { api } from "@/api";
import { getEditableSteps } from "@/api/labs";
import type { LabHint, LabStep } from "@/api/types";
import ReportButton from "@/components/moderation/ReportButton";

type Hint = LabHint;

type Step = LabStep & {
  validation_type: "exact_match" | "contains" | "regex";
  points: number;
  hints: Hint[];
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
  icon: typeof Clock3;
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

export default function CreatorLabDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "easy",
    visibility: "private",
    template_path: "",
    lab_type: "",
    lab_delivery: "terminal",
    app_port: "",
    estimated_duration: "",
  });

  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLab() {
      setLoading(true);
      setLoadError(null);

      try {
        const lab = await api.getLab(id!);
        const stepsData = await getEditableSteps(id!);

        const stepsWithHints = await Promise.all(
          stepsData.map(async (step) => {
            const hints = step.step_id ? await api.getHints(id!, step.step_id) : [];

            return {
              ...step,
              validation_type: step.validation_type ?? "exact_match",
              points: step.points ?? 0,
              hints,
            } as Step;
          }),
        );

        if (cancelled) return;

        setSteps(stepsWithHints);

        setForm({
          name: lab.name ?? "",
          description: lab.description ?? "",
          difficulty:
            lab.difficulty === "EASY"
              ? "easy"
              : lab.difficulty === "MEDIUM"
                ? "medium"
                : "hard",
          visibility: lab.visibility === "PUBLIC" ? "public" : "private",
          template_path: lab.template_path ?? "",
          lab_type: lab.lab_type ?? "",
          lab_delivery: lab.lab_delivery === "web" ? "web" : "terminal",
          app_port:
            lab.lab_delivery === "web" && lab.runtime?.app_port != null
              ? String(lab.runtime.app_port)
              : "",
          estimated_duration: lab.estimated_duration ?? "",
        });
      } catch (err) {
        console.error("Failed to load lab", err);

        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Failed to load lab details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLab();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalHints = useMemo(
    () => steps.reduce((sum, step) => sum + step.hints.length, 0),
    [steps],
  );

  const hasSteps = steps.length > 0;
  const visibleSteps = steps.slice(0, 3);

  const difficultyLabel =
    form.difficulty === "easy"
      ? "Easy"
      : form.difficulty === "medium"
        ? "Medium"
        : "Hard";

  const visibilityLabel = form.visibility === "public" ? "Public" : "Private";
  const deliveryLabel = form.lab_delivery === "web" ? "Web" : "Terminal";
  const durationLabel = form.estimated_duration
    ? `${form.estimated_duration} min`
    : "Not set";

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

  if (loadError) {
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
              Failed to load lab details
            </div>
            <div className="mt-2 text-sm leading-relaxed text-red-200/90">
              {loadError}
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
            Creator lab
          </div>

          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
                {form.name || "Lab"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                {form.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill
                icon={ListOrdered}
                label="Steps"
                value={`${steps.length}`}
              />
              <SummaryPill
                icon={CheckCircle2}
                label="Hints"
                value={`${totalHints}`}
              />
              <SummaryPill
                icon={Clock3}
                label="Estimated duration"
                value={durationLabel}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/creator/lab/${id}/edit`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/86 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.18)]"
              type="button"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit lab</span>
            </button>

            <button
              onClick={() => navigate(`/creator/lab/${id}/steps`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/40 hover:bg-white/5"
              type="button"
            >
              <ListOrdered className="h-4 w-4" />
              <span>{hasSteps ? "Manage steps" : "Create steps"}</span>
            </button>

            <button
              onClick={() => navigate(`/creator/lab/${id}/analytics`)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-emerald-400/40 hover:bg-white/5"
              type="button"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>

            {id ? (
              <ReportButton targetType="lab" targetId={id} targetLabel={form.name || "Lab"} />
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
                    Steps overview
                  </div>
                  <div className="mt-2 text-sm text-white/60">
                    Preview the first milestones of the lab progression.
                  </div>
                </div>

                {hasSteps && (
                  <button
                    onClick={() => navigate(`/creator/lab/${id}/steps`)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-white/74 transition hover:border-white/15 hover:bg-white/5"
                    type="button"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View all</span>
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {!hasSteps ? (
                  <EmptyStateCard
                    title="No steps defined yet"
                    text="This lab does not have any structured steps yet. Add steps to define milestones, validation, and hints."
                    actionLabel="Create steps"
                    onAction={() => navigate(`/creator/lab/${id}/steps`)}
                  />
                ) : (
                  visibleSteps.map((step) => (
                    <div
                      key={step.step_id ?? step.step_number}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-white/45">
                            Step {step.step_number}
                          </div>
                          <div className="mt-2 text-base font-semibold text-white/90">
                            {step.title || `Untitled step ${step.step_number}`}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-white/45">
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                            {step.points} pts
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                            {step.validation_type.replace("_", " ")}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
                            {step.hints.length} hint{step.hints.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div>
                          <FieldLabel>Question</FieldLabel>
                          <DisplayBlock>{step.question}</DisplayBlock>
                        </div>

                        <div>
                          <FieldLabel>Expected answer</FieldLabel>
                          <DisplayBlock>{step.expected_answer}</DisplayBlock>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {steps.length > 3 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/52">
                    {steps.length - 3} more step{steps.length - 3 > 1 ? "s" : ""} not
                    shown in this preview.
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
                  onClick={() => navigate(`/creator/lab/${id}/edit`)}
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
                      {form.visibility === "public" ? (
                        <Globe className="h-4 w-4 text-emerald-300" />
                      ) : (
                        <Lock className="h-4 w-4 text-white/55" />
                      )}
                      <span>{visibilityLabel}</span>
                    </div>
                  </DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Delivery</FieldLabel>
                  <DisplayBlock>
                    <div className="flex items-center gap-2">
                      {form.lab_delivery === "web" ? (
                        <Globe className="h-4 w-4 text-sky-300" />
                      ) : (
                        <TerminalSquare className="h-4 w-4 text-white/55" />
                      )}
                      <span>{deliveryLabel}</span>
                    </div>
                  </DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Estimated duration</FieldLabel>
                  <DisplayBlock>{durationLabel}</DisplayBlock>
                </div>

                {form.lab_delivery === "web" && (
                  <div>
                    <FieldLabel>Application port</FieldLabel>
                    <DisplayBlock>{form.app_port}</DisplayBlock>
                  </div>
                )}

                <div>
                  <FieldLabel>Template path</FieldLabel>
                  <DisplayBlock>{form.template_path}</DisplayBlock>
                </div>

                <div>
                  <FieldLabel>Lab type</FieldLabel>
                  <DisplayBlock>
                    <div className="flex items-center gap-2">
                      <FileCode2 className="h-4 w-4 text-white/55" />
                      <span>{form.lab_type || "Not set"}</span>
                    </div>
                  </DisplayBlock>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
