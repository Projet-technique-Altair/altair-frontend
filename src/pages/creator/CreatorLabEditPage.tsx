// src/pages/creator/CreatorLabEditPage.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { api } from "@/api";
import { getEditableSteps } from "@/api/labs";
import type { LabHint, LabStep } from "@/api/types";

type Hint = LabHint;

type Step = LabStep & {
  validation_type: "exact_match" | "contains" | "regex";
  points: number;
  hints: Hint[];
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] uppercase tracking-wide text-white/50">
      {children}
    </label>
  );
}

function InputShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default function CreatorLabEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    name: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    visibility: "private" | "public";
    template_path: string;
    lab_type: string;
    lab_delivery: "terminal" | "web";
    app_port: string;
    estimated_duration: string;
  }>({
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
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (field: string, value: string) => {
    setSaveMessage(null);
    setForm((prev) => ({
      ...prev,
      ...(field === "lab_delivery" && value !== "web" ? { app_port: "" } : {}),
      [field]: value,
    }));
  };

  const parseAppPort = () => {
    const normalized = form.app_port.trim();

    if (form.lab_delivery !== "web") {
      return null;
    }

    if (!normalized) {
      throw new Error("Set the application port for web labs.");
    }

    const parsed = Number.parseInt(normalized, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Application port must be a positive integer.");
    }

    return parsed;
  };

  const parseEstimatedDuration = () => {
    const normalized = form.estimated_duration.trim();

    if (!normalized) {
      return undefined;
    }

    if (!/^\d+$/.test(normalized)) {
      throw new Error("Estimated duration must be a positive integer.");
    }

    const parsed = Number.parseInt(normalized, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new Error("Estimated duration must be a positive integer.");
    }

    return String(parsed);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadLab() {
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
                : lab.difficulty === "HARD"
                  ? "hard"
                  : "easy",
          visibility:
            lab.visibility === "PUBLIC"
              ? "public"
              : lab.visibility === "PRIVATE"
                ? "private"
                : "private",
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLab();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const appPort = parseAppPort();
      const estimatedDuration = parseEstimatedDuration();

      await api.updateLab(id!, {
        name: form.name,
        description: form.description,
        difficulty: form.difficulty,
        visibility: form.visibility,
        template_path: form.template_path,
        lab_type: form.lab_type,
        lab_delivery: form.lab_delivery,
        runtime:
          form.lab_delivery === "web"
            ? {
                app_port: appPort,
                services: [],
                entrypoints: [],
              }
            : undefined,
        estimated_duration: estimatedDuration,
      });

      for (const step of steps) {
        let stepId = step.step_id;

        if (stepId) {
          await api.updateStep(id!, stepId, step);
        } else {
          const created = await api.createStep(id!, step);
          stepId = created.step_id;

          if (!stepId) {
            throw new Error("Created step is missing step_id");
          }
        }

        for (const hint of step.hints) {
          if (hint.hint_id) {
            await api.updateHint(id!, stepId, hint.hint_id, hint);
          } else {
            await api.createHint(id!, stepId, hint);
          }
        }
      }

      setSaveMessage({
        type: "success",
        text: "Changes saved successfully.",
      });

      window.setTimeout(() => {
        navigate(`/creator/lab/${id}`);
      }, 700);
    } catch (err) {
      console.error("Failed to update lab", err);
      setSaveMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (stepIndex: number) => {
    const step = steps[stepIndex];

    try {
      if (step.step_id) {
        await api.deleteStep(id!, step.step_id);
      }

      const copy = [...steps];
      copy.splice(stepIndex, 1);

      copy.forEach((s, i) => {
        s.step_number = i + 1;
      });

      setSteps(copy);
      setSaveMessage(null);
    } catch (err) {
      console.error("Failed to delete step", err);
    }
  };

  const handleDeleteHint = async (stepIndex: number, hintIndex: number) => {
    const step = steps[stepIndex];
    const hint = step.hints[hintIndex];

    try {
      if (hint.hint_id) {
        await api.deleteHint(id!, step.step_id!, hint.hint_id);
      }

      const copy = [...steps];
      copy[stepIndex].hints.splice(hintIndex, 1);

      copy[stepIndex].hints.forEach((h, i) => {
        h.hint_number = i + 1;
      });

      setSteps(copy);
      setSaveMessage(null);
    } catch (err) {
      console.error("Failed to delete hint", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <div className="animate-pulse text-white/50">Loading editor…</div>
      </div>
    );
  }

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

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
            Edit lab
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Update the lab configuration, content structure, steps, and hints.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                saving ? "cursor-not-allowed opacity-60" : ""
              }`}
              type="button"
            >
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </div>

          {saveMessage && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                saveMessage.type === "success"
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Lab content
              </div>

              <div className="mt-4 space-y-4">
                <InputShell>
                  <FieldLabel>Name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Lab name"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                    placeholder="Describe the purpose and framing of this lab"
                  />
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Steps
              </div>

              <div className="mt-4 space-y-4">
                {steps.map((step, stepIndex) => (
                  <div
                    key={step.step_id ?? stepIndex}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[11px] uppercase tracking-wide text-white/45">
                        Step {step.step_number}
                      </div>

                      <button
                        disabled={steps.length === 1}
                        onClick={() => handleDeleteStep(stepIndex)}
                        className="text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      <InputShell>
                        <FieldLabel>Title</FieldLabel>
                        <input
                          value={step.title}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[stepIndex].title = e.target.value;
                            setSteps(copy);
                            setSaveMessage(null);
                          }}
                          className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                          placeholder="Step title"
                        />
                      </InputShell>

                      <InputShell>
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                          value={step.description}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[stepIndex].description = e.target.value;
                            setSteps(copy);
                            setSaveMessage(null);
                          }}
                          rows={4}
                          className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28"
                          placeholder="Step description"
                        />
                      </InputShell>

                      <InputShell>
                        <FieldLabel>Question</FieldLabel>
                        <input
                          value={step.question}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[stepIndex].question = e.target.value;
                            setSteps(copy);
                            setSaveMessage(null);
                          }}
                          className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                          placeholder="Validation question"
                        />
                      </InputShell>

                      <InputShell>
                        <FieldLabel>Expected answer</FieldLabel>
                        <input
                          value={step.expected_answer}
                          onChange={(e) => {
                            const copy = [...steps];
                            copy[stepIndex].expected_answer = e.target.value;
                            setSteps(copy);
                            setSaveMessage(null);
                          }}
                          className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                          placeholder="Expected answer"
                        />
                      </InputShell>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-[11px] uppercase tracking-wide text-white/50">
                          Hints
                        </div>

                        <div className="mt-4 space-y-3">
                          {step.hints.length > 0 ? (
                            step.hints.map((hint, hintIndex) => (
                              <div
                                key={hint.hint_id ?? `${stepIndex}-${hintIndex}`}
                                className="rounded-xl border border-white/10 bg-black/20 p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    value={hint.text}
                                    onChange={(e) => {
                                      const copy = [...steps];
                                      copy[stepIndex].hints[hintIndex].text =
                                        e.target.value;
                                      setSteps(copy);
                                      setSaveMessage(null);
                                    }}
                                    className="w-full border-0 bg-transparent p-0 text-sm text-white/82 outline-none placeholder:text-white/28"
                                    placeholder={`Hint ${hintIndex + 1}`}
                                  />

                                  <button
                                    onClick={() =>
                                      handleDeleteHint(stepIndex, hintIndex)
                                    }
                                    className="text-xs font-medium text-red-300 transition hover:text-red-200"
                                    type="button"
                                  >
                                    Delete
                                  </button>
                                </div>

                                <div className="mt-3 text-xs text-white/45">
                                  Hint {hint.hint_number} · Cost: {hint.cost}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-white/60">
                              No hints added yet.
                            </div>
                          )}

                          <button
                            onClick={() => {
                              const copy = [...steps];
                              copy[stepIndex].hints.push({
                                hint_number: step.hints.length + 1,
                                cost: 0,
                                text: "",
                              });
                              setSteps(copy);
                              setSaveMessage(null);
                            }}
                            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-white/15 hover:bg-white/5"
                            type="button"
                          >
                            Add hint
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setSteps([
                      ...steps,
                      {
                        step_number: Math.max(0, ...steps.map((s) => s.step_number)) + 1,
                        title: "",
                        description: "",
                        question: "",
                        expected_answer: "",
                        validation_type: "exact_match",
                        validation_pattern: null,
                        points: 10,
                        hints: [],
                      },
                    ]);
                    setSaveMessage(null);
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-purple-400/30 hover:bg-white/5"
                  type="button"
                >
                  Add step
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Configuration
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Difficulty</FieldLabel>
                  <select
                    value={form.difficulty}
                    onChange={(e) => handleChange("difficulty", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="easy" className="bg-[#0f172a]">
                      easy
                    </option>
                    <option value="medium" className="bg-[#0f172a]">
                      medium
                    </option>
                    <option value="hard" className="bg-[#0f172a]">
                      hard
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Visibility</FieldLabel>
                  <select
                    value={form.visibility}
                    onChange={(e) => handleChange("visibility", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="private" className="bg-[#0f172a]">
                      private
                    </option>
                    <option value="public" className="bg-[#0f172a]">
                      public
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Delivery</FieldLabel>
                  <select
                    value={form.lab_delivery}
                    onChange={(e) => handleChange("lab_delivery", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none"
                  >
                    <option value="terminal" className="bg-[#0f172a]">
                      terminal
                    </option>
                    <option value="web" className="bg-[#0f172a]">
                      web
                    </option>
                  </select>
                </InputShell>

                <InputShell>
                  <FieldLabel>Estimated duration</FieldLabel>
                  <input
                    value={form.estimated_duration}
                    onChange={(e) =>
                      handleChange("estimated_duration", e.target.value)
                    }
                    inputMode="numeric"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30"
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                  />
                </InputShell>

                {form.lab_delivery === "web" && (
                  <InputShell>
                    <FieldLabel>Application port</FieldLabel>
                    <input
                      value={form.app_port}
                      onChange={(e) => handleChange("app_port", e.target.value)}
                      inputMode="numeric"
                      placeholder="3000"
                      className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </InputShell>
                )}

                <InputShell>
                  <FieldLabel>Template path</FieldLabel>
                  <input
                    value={form.template_path}
                    onChange={(e) => handleChange("template_path", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Template path"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Lab type</FieldLabel>
                  <input
                    value={form.lab_type}
                    onChange={(e) => handleChange("lab_type", e.target.value)}
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    placeholder="Lab type"
                  />
                </InputShell>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}