import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  GripVertical,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Target,
  Trash2,
} from "lucide-react";

import { createHint, createStep } from "@/api/labs";
import type { LabHint, LabStep } from "@/api/types";

type Hint = LabHint;

type Step = LabStep & {
  validation_type: "exact_match" | "contains" | "regex";
  validation_pattern: string | null;
  points: number;
  hints: Hint[];
};

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/58">
      <span>{children}</span>
      {required && <span className="text-[10px] text-sky-300/80">Required</span>}
    </div>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-relaxed text-white/42">{children}</p>;
}

function InputShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 transition focus-within:border-sky-400/40 focus-within:bg-white/[0.055] focus-within:shadow-[0_0_0_1px_rgba(56,189,248,0.16)] ${className}`}
    >
      {children}
    </div>
  );
}

function SummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
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

function buildEmptyStep(stepNumber: number): Step {
  return {
    step_number: stepNumber,
    title: "",
    description: "",
    question: "",
    expected_answer: "",
    validation_type: "exact_match",
    validation_pattern: null,
    points: 10,
    hints: [],
  };
}

export default function LabStepsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [steps, setSteps] = useState<Step[]>([buildEmptyStep(1)]);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    0: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveStage, setSaveStage] = useState<
    "idle" | "validating" | "saving" | "success"
  >("idle");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!id) return null;

  const totalHints = steps.reduce((sum, step) => sum + step.hints.length, 0);

  const completion = useMemo(() => {
    let filled = 0;
    let total = 0;

    for (const step of steps) {
      total += 4;
      if (step.title.trim()) filled += 1;
      if (step.description.trim()) filled += 1;
      if (step.question.trim()) filled += 1;
      if (step.expected_answer.trim()) filled += 1;

      if (step.validation_type === "regex") {
        total += 1;
        if ((step.validation_pattern ?? "").trim()) filled += 1;
      }
    }

    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [steps]);

  const renumberSteps = (items: Step[]) =>
    items.map((step, index) => ({
      ...step,
      step_number: index + 1,
      hints: step.hints.map((hint, hintIndex) => ({
        ...hint,
        hint_number: hintIndex + 1,
      })),
    }));

  const updateStep = (index: number, patch: Partial<Step>) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== index) return step;

        const nextStep = { ...step, ...patch };

        if (
          patch.validation_type &&
          patch.validation_type !== "regex" &&
          nextStep.validation_pattern
        ) {
          nextStep.validation_pattern = null;
        }

        return nextStep;
      }),
    );
    setMessage(null);
  };

  const updateHint = (
    stepIndex: number,
    hintIndex: number,
    patch: Partial<Hint>,
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== stepIndex) return step;

        return {
          ...step,
          hints: step.hints.map((hint, j) =>
            j === hintIndex ? { ...hint, ...patch } : hint,
          ),
        };
      }),
    );
    setMessage(null);
  };

  const addStep = () => {
    setSteps((prev) => {
      const next = [...prev, buildEmptyStep(prev.length + 1)];
      return next;
    });

    setExpandedSteps((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((key) => [Number(key), false])),
      [steps.length]: true,
    }));

    setMessage(null);
  };

  const deleteStep = (index: number) => {
    if (steps.length === 1) return;

    setSteps((prev) => renumberSteps(prev.filter((_, i) => i !== index)));

    setExpandedSteps((prev) => {
      const next: Record<number, boolean> = {};
      const remainingIndexes = steps
        .map((_, i) => i)
        .filter((i) => i !== index);

      remainingIndexes.forEach((oldIndex, newIndex) => {
        next[newIndex] = prev[oldIndex] ?? false;
      });

      if (Object.values(next).every((value) => !value)) {
        next[0] = true;
      }

      return next;
    });

    setMessage(null);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    setSteps((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return renumberSteps(next);
    });

    setExpandedSteps((prev) => {
      const next = { ...prev };
      const currentExpanded = prev[index] ?? false;
      const targetExpanded = prev[targetIndex] ?? false;
      next[index] = targetExpanded;
      next[targetIndex] = currentExpanded;
      return next;
    });

    setMessage(null);
  };

  const addHint = (stepIndex: number) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== stepIndex) return step;

        return {
          ...step,
          hints: [
            ...step.hints,
            {
              hint_number: step.hints.length + 1,
              text: "",
              cost: 0,
            },
          ],
        };
      }),
    );
    setMessage(null);
  };

  const deleteHint = (stepIndex: number, hintIndex: number) => {
    setSteps((prev) =>
      prev.map((step, i) => {
        if (i !== stepIndex) return step;

        const nextHints = step.hints
          .filter((_, j) => j !== hintIndex)
          .map((hint, idx) => ({
            ...hint,
            hint_number: idx + 1,
          }));

        return {
          ...step,
          hints: nextHints,
        };
      }),
    );
    setMessage(null);
  };

  const toggleExpanded = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const validateSteps = () => {
    if (steps.length === 0) {
      throw new Error("Add at least one step.");
    }

    for (const step of steps) {
      if (!step.title.trim()) {
        throw new Error(`Step ${step.step_number}: title is required.`);
      }

      if (!step.description.trim()) {
        throw new Error(`Step ${step.step_number}: description is required.`);
      }

      if (!step.question.trim()) {
        throw new Error(`Step ${step.step_number}: question is required.`);
      }

      if (!step.expected_answer.trim()) {
        throw new Error(`Step ${step.step_number}: expected answer is required.`);
      }

      if (step.validation_type === "regex" && !(step.validation_pattern ?? "").trim()) {
        throw new Error(`Step ${step.step_number}: regex pattern is required.`);
      }

      if (!Number.isFinite(step.points) || step.points <= 0) {
        throw new Error(`Step ${step.step_number}: points must be greater than 0.`);
      }

      for (const hint of step.hints) {
        if (!hint.text.trim()) {
          throw new Error(`Step ${step.step_number}: hint text cannot be empty.`);
        }

        if (!Number.isFinite(hint.cost) || hint.cost < 0) {
          throw new Error(`Step ${step.step_number}: hint cost cannot be negative.`);
        }
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStage("validating");
    setMessage(null);

    try {
      validateSteps();

      setSaveStage("saving");

      for (const step of steps) {
        const createdStep = await createStep(id, {
          step_number: step.step_number,
          title: step.title.trim(),
          description: step.description.trim(),
          question: step.question.trim(),
          expected_answer: step.expected_answer.trim(),
          validation_type: step.validation_type,
          validation_pattern:
            step.validation_type === "regex"
              ? step.validation_pattern?.trim() || null
              : null,
          points: step.points,
        });

        const stepId = createdStep.step_id;
        if (!stepId) throw new Error("Missing step_id");

        for (const hint of step.hints) {
          await createHint(id, stepId, {
            ...hint,
            text: hint.text.trim(),
          });
        }
      }

      setSaveStage("success");
      setMessage({
        type: "success",
        text: "Steps saved successfully. Redirecting to the lab overview.",
      });

      window.setTimeout(() => {
        navigate(`/creator/lab/${id}`);
      }, 700);
    } catch (err) {
      console.error(err);
      setSaveStage("idle");
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save steps.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveLabel =
    saveStage === "validating"
      ? "Validating steps"
      : saveStage === "saving"
        ? "Saving steps"
        : saveStage === "success"
          ? "Saved"
          : "Ready";

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate(`/creator/lab/${id}`)}
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
                Steps editor
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                Define the progression of the lab with structured validation,
                scoring, and optional hints for each milestone.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryPill
                icon={Target}
                label="Steps"
                value={`${steps.length}`}
              />
              <SummaryPill
                icon={HelpCircle}
                label="Hints"
                value={`${totalHints}`}
              />
              <SummaryPill
                icon={ShieldCheck}
                label="Completion"
                value={`${completion}%`}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                saving ? "cursor-not-allowed opacity-70" : ""
              }`}
              type="button"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{saveLabel}…</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save steps</span>
                </>
              )}
            </button>

            <button
              onClick={addStep}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/30 hover:bg-white/5 ${
                saving ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>Add step</span>
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {saveStage === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : saving ? (
                <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
              ) : (
                <CircleAlert className="h-4 w-4 text-white/45" />
              )}
              <span>{saveLabel}</span>
            </div>
          </div>

          {(saving || saveStage === "success") && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <div
                className={`h-1.5 transition-all duration-500 ${
                  saveStage === "validating"
                    ? "w-[28%] bg-sky-400/70"
                    : saveStage === "saving"
                      ? "w-[82%] bg-sky-400/70"
                      : "w-full bg-emerald-400/70"
                }`}
              />
              <div className="px-4 py-3 text-sm text-white/68">
                {saveStage === "validating" &&
                  "Checking required fields, validation rules, and hint content."}
                {saveStage === "saving" &&
                  "Creating steps and associated hints for this lab."}
                {saveStage === "success" &&
                  "Steps have been saved successfully. Redirecting to the lab overview."}
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            {steps.map((step, index) => {
              const isExpanded = expandedSteps[index] ?? false;
              const isRegex = step.validation_type === "regex";

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-2 text-white/38">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wide text-white/45">
                          Step {step.step_number}
                        </div>
                        <div className="mt-2 truncate text-base font-semibold text-white/90">
                          {step.title.trim() || `Untitled step ${step.step_number}`}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                            {step.points} pts
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                            {step.validation_type.replace("_", " ")}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                            {step.hints.length} hint{step.hints.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => moveStep(index, -1)}
                        disabled={index === 0 || saving}
                        className={`rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5 ${
                          index === 0 || saving
                            ? "cursor-not-allowed opacity-35"
                            : ""
                        }`}
                        type="button"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => moveStep(index, 1)}
                        disabled={index === steps.length - 1 || saving}
                        className={`rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5 ${
                          index === steps.length - 1 || saving
                            ? "cursor-not-allowed opacity-35"
                            : ""
                        }`}
                        type="button"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleExpanded(index)}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75 transition hover:border-white/15 hover:bg-white/5"
                        type="button"
                      >
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>

                      <button
                        onClick={() => deleteStep(index)}
                        disabled={steps.length === 1 || saving}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs transition ${
                          steps.length === 1 || saving
                            ? "cursor-not-allowed border-white/10 bg-black/20 text-white/28"
                            : "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                        }`}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 space-y-4">
                      <InputShell>
                        <FieldLabel required>Title</FieldLabel>
                        <input
                          value={step.title}
                          onChange={(e) =>
                            updateStep(index, { title: e.target.value })
                          }
                          className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                          placeholder="Step title"
                        />
                      </InputShell>

                      <InputShell>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                          value={step.description}
                          onChange={(e) =>
                            updateStep(index, { description: e.target.value })
                          }
                          rows={4}
                          className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                          placeholder="Describe the objective of this step"
                        />
                      </InputShell>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <InputShell>
                          <FieldLabel required>Question</FieldLabel>
                          <input
                            value={step.question}
                            onChange={(e) =>
                              updateStep(index, { question: e.target.value })
                            }
                            className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                            placeholder="Validation question"
                          />
                          <FieldHint>
                            This prompt is shown to verify the learner milestone.
                          </FieldHint>
                        </InputShell>

                        <InputShell>
                          <FieldLabel required>Expected answer</FieldLabel>
                          <input
                            value={step.expected_answer}
                            onChange={(e) =>
                              updateStep(index, {
                                expected_answer: e.target.value,
                              })
                            }
                            className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                            placeholder="Expected answer"
                          />
                        </InputShell>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <InputShell>
                          <FieldLabel>Validation type</FieldLabel>
                          <select
                            value={step.validation_type}
                            onChange={(e) =>
                              updateStep(index, {
                                validation_type: e.target
                                  .value as Step["validation_type"],
                              })
                            }
                            className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                          >
                            <option value="exact_match" className="bg-[#0f172a]">
                              exact match
                            </option>
                            <option value="contains" className="bg-[#0f172a]">
                              contains
                            </option>
                            <option value="regex" className="bg-[#0f172a]">
                              regex
                            </option>
                          </select>
                        </InputShell>

                        <InputShell>
                          <FieldLabel>Points</FieldLabel>
                          <input
                            value={step.points}
                            onChange={(e) =>
                              updateStep(index, {
                                points: Math.max(
                                  0,
                                  Number.parseInt(e.target.value || "0", 10),
                                ),
                              })
                            }
                            inputMode="numeric"
                            type="number"
                            min="1"
                            step="1"
                            className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                            placeholder="10"
                          />
                        </InputShell>

                        <InputShell className={isRegex ? "" : "opacity-55"}>
                          <FieldLabel required={isRegex}>Validation pattern</FieldLabel>
                          <input
                            value={step.validation_pattern ?? ""}
                            onChange={(e) =>
                              updateStep(index, {
                                validation_pattern: e.target.value,
                              })
                            }
                            disabled={!isRegex}
                            className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={isRegex ? "Regex pattern" : "Only used for regex"}
                          />
                          <FieldHint>
                            Used only when the validation type is set to regex.
                          </FieldHint>
                        </InputShell>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-white/50">
                              Hints
                            </div>
                            <div className="mt-2 text-sm text-white/60">
                              Optional guidance that learners can unlock during
                              the step.
                            </div>
                          </div>

                          <button
                            onClick={() => addHint(index)}
                            disabled={saving}
                            className={`inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-purple-400/30 hover:bg-white/5 ${
                              saving ? "cursor-not-allowed opacity-60" : ""
                            }`}
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add hint</span>
                          </button>
                        </div>

                        <div className="mt-4 space-y-3">
                          {step.hints.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/45">
                              No hints added yet.
                            </div>
                          ) : (
                            step.hints.map((hint, hintIndex) => (
                              <div
                                key={`${index}-${hintIndex}`}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                              >
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                                      Hint {hint.hint_number}
                                    </div>

                                    <textarea
                                      value={hint.text}
                                      onChange={(e) =>
                                        updateHint(index, hintIndex, {
                                          text: e.target.value,
                                        })
                                      }
                                      rows={3}
                                      placeholder="Hint text"
                                      className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 xl:w-[180px]">
                                    <InputShell className="p-3">
                                      <FieldLabel>Cost</FieldLabel>
                                      <input
                                        value={hint.cost}
                                        onChange={(e) =>
                                          updateHint(index, hintIndex, {
                                            cost: Math.max(
                                              0,
                                              Number.parseInt(
                                                e.target.value || "0",
                                                10,
                                              ),
                                            ),
                                          })
                                        }
                                        inputMode="numeric"
                                        type="number"
                                        min="0"
                                        step="1"
                                        className="mt-2 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                                        placeholder="0"
                                      />
                                    </InputShell>

                                    <button
                                      onClick={() => deleteHint(index, hintIndex)}
                                      disabled={saving}
                                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs transition ${
                                        saving
                                          ? "cursor-not-allowed border-white/10 bg-black/20 text-white/28"
                                          : "border-red-400/20 bg-red-500/10 text-red-200 hover:border-red-400/30 hover:bg-red-500/15"
                                      }`}
                                      type="button"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={addStep}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-400/30 px-4 py-3 text-sm text-purple-200 transition hover:bg-purple-500/10 ${
                saving ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              <Plus className="h-4 w-4" />
              <span>Add step</span>
            </button>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md xl:sticky xl:top-6">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Guidance
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    <Target className="h-4 w-4 text-sky-300" />
                    Step structure
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    Each step should describe one milestone, one validation
                    question, and one expected answer.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    <Search className="h-4 w-4 text-purple-300" />
                    Validation rules
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    Use exact match for strict answers, contains for partial
                    checks, and regex only when pattern matching is required.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/86">
                    <HelpCircle className="h-4 w-4 text-emerald-300" />
                    Hints
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/58">
                    Keep hints short and useful. Use cost to balance how much
                    help learners can unlock during the lab.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/44">
                  After saving, you will return to the lab overview where you
                  can continue with configuration and analytics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}