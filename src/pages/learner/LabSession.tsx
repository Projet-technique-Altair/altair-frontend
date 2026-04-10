// src/pages/learner/LabSession.tsx

/**
 * @file LabSession — interactive learner lab session environment.
 *
 * Behavior:
 * - Default (real): fetch lab metadata from backend + fetch runtime session from backend
 * - Mock (?mock=1): NO backend calls (no getLab, no runtime). Uses mock lab + mock steps.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { bootstrapWebSession, getHints, getLab, getSteps, startLab } from "@/api/labs";
import {
  getSession,
  getSessionProgress,
  requestSessionHint,
  stopSession,
  validateSessionStep,
  type SessionProgress,
} from "@/api/sessions";
import type { Lab } from "@/contracts/labs";

import LabHeader from "@/components/labs/LabHeader";
import LabInstructions from "@/components/labs/LabInstructions";
import Terminal from "@/components/labs/Terminal";
import { useLabTimer } from "@/hooks/useLabTimer";
import type { LabHint, LabStep as ApiLabStep } from "@/api/types";



/* =========================
   Types (UI runtime)
========================= */

type LabStep = {
  step_id?: string;
  step_number?: number;
  title: string;
  instruction: string;
  question?: string;
  points?: number;
  has_validation?: boolean;
  hints?: Array<{
    hint_number: number;
    cost: number;
    text: string;
  }>;
};

type SessionRuntime = {
  sessionId?: string;
  labId: string;
  containerId?: string | null;
  status?: string | null;
  runtimeKind?: string | null;
  webshellUrl?: string | null;
  appUrl?: string | null;
};

type MockLabVM = {
  lab_id: string;
  name: string;
  description?: string | null;
  difficulty?: string | null;
};

/* =========================
   Mock builders
========================= */

function buildMockLab(id: string): MockLabVM {
  switch (id) {
    case "mock-in-progress":
      return {
        lab_id: id,
        name: "Mock Lab — In Progress",
        description: "Fake lab used to validate the LabSession UI (mock mode).",
        difficulty: "INTERMEDIATE",
      };
    case "mock-completed":
      return {
        lab_id: id,
        name: "Mock Lab — Completed",
        description: "Fake lab used to validate completed flow (mock mode).",
        difficulty: "BEGINNER",
      };
    default:
      return {
        lab_id: id,
        name: `Mock Lab — ${id}`,
        description: "Generic mock lab (mock mode).",
        difficulty: "BEGINNER",
      };
  }
}

function buildMockSteps(id: string): LabStep[] {
  if (id === "mock-completed") {
    return [
      {
        title: "Completed Session (Preview)",
        instruction:
          "This session is already marked as completed (visual preview).\n\nType `ALTAIR{done}` to validate.",
        question: "Type the exact mock flag.",
        points: 20,
        has_validation: true,
        hints: [{ hint_number: 1, cost: 2, text: "Just type the exact flag for mock." }],
      },
    ];
  }

  // default = in progress
  return [
    {
      title: "Warmup — Environment check",
      instruction: "Type `whoami` in the terminal and copy the output.",
      question: "What command prints the current user?",
      points: 10,
      has_validation: true,
      hints: [{ hint_number: 1, cost: 2, text: "Basic Linux identity command." }],
    },
    {
      title: "Recon — Find the target",
      instruction: "List files in the current directory using `ls -la`.",
      question: "Which command lists hidden files in long format?",
      points: 10,
      has_validation: true,
      hints: [{ hint_number: 1, cost: 2, text: "Use ls with long format + show hidden." }],
    },
    {
      title: "Validate — Submit the flag",
      instruction:
        "When you find the flag, paste it here (example: `ALTAIR{...}`).\n\nFor mock, just type `ALTAIR{mock_flag}`.",
      question: "Submit the mock flag.",
      points: 20,
      has_validation: true,
      hints: [{ hint_number: 1, cost: 5, text: "In real labs, flags are usually inside a file or an env variable." }],
    },
  ];
}

/* =========================
   Helpers: auth
========================= */

function getAuthToken(): string | null {
  return sessionStorage.getItem("altair_token");
}

type RuntimeStepInput = Partial<ApiLabStep> & {
  name?: string;
  label?: string;
  question_title?: string;
  prompt?: string;
  text?: string;
  body?: string;
  stepId?: string;
  stepNumber?: number;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function normalizeRuntimeStep(raw: RuntimeStepInput, index: number): LabStep {
  const title =
    raw?.title ??
    raw?.name ??
    raw?.label ??
    raw?.question_title ??
    `Step ${index + 1}`;

  const instruction =
    raw?.instruction ??
    raw?.description ??
    raw?.prompt ??
    raw?.text ??
    raw?.body ??
    "No instruction provided.";
  const question =
    raw?.question ??
    raw?.prompt ??
    undefined;

  return {
    step_id: raw?.step_id ?? raw?.stepId,
    step_number: raw?.step_number ?? raw?.stepNumber ?? index + 1,
    title: String(title),
    instruction: String(instruction),
    question: question != null ? String(question) : undefined,
    points: raw?.points != null ? Number(raw.points) : undefined,
    has_validation: Boolean(raw?.has_validation ?? raw?.question),
    hints: Array.isArray(raw?.hints) ? (raw.hints as LabHint[]) : [],
  };
}

/* =========================
   Runtime session fetcher
========================= */

/*type TryEndpoint = {
  method: "GET" | "POST";
  path: (labId: string) => string;
  body?: (labId: string) => any;
};*/

function sessionKey(labId: string) {
  return `altair_session_${labId}`;
}

function getStoredSessionId(labId: string): string | null {
  return sessionStorage.getItem(sessionKey(labId));
}

function storeSessionId(labId: string, sessionId: string) {
  sessionStorage.setItem(sessionKey(labId), sessionId);
}

function clearStoredSessionId(labId: string) {
  sessionStorage.removeItem(sessionKey(labId));
}

async function fetchSessionRuntime(labId: string): Promise<SessionRuntime> {
  const cached = getStoredSessionId(labId);

  if (cached) {
    try {
      const existing = await getSession(cached);
      const status = String(existing?.status ?? "").toLowerCase();
      const runtimeKind = existing?.runtime_kind ?? null;
      const webshellUrl = existing?.webshell_url ?? null;
      const appUrl = existing?.app_url ?? null;

      if (status === "created" || status === "running" || webshellUrl || appUrl) {
        return {
          sessionId: cached,
          labId,
          containerId: existing?.container_id ?? null,
          status,
          runtimeKind,
          webshellUrl,
          appUrl,
        };
      }

      clearStoredSessionId(labId);
    } catch {
      clearStoredSessionId(labId);
    }
  }

  const started = await startLab(labId);
  const sessionId = started?.session_id;

  if (!sessionId) {
    throw new Error("Start succeeded but did not return a session_id");
  }

  storeSessionId(labId, sessionId);
  return {
    sessionId,
    labId,
    containerId: started?.container_id ?? null,
    status: started?.status ?? null,
    runtimeKind: started?.runtime_kind ?? null,
    webshellUrl: started?.webshell_url ?? null,
    appUrl: started?.app_url ?? null,
  };
}


/* =========================
   Component
========================= */

export default function LabSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();

  const mockUI = useMemo(() => new URLSearchParams(search).get("mock") === "1", [search]);

  const [lab, setLab] = useState<Lab | MockLabVM | null>(null);
  const [session, setSession] = useState<SessionRuntime | null>(null);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [steps, setSteps] = useState<LabStep[]>([]);
  const [revealedHints, setRevealedHints] = useState<Record<number, LabStep["hints"]>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webSessionReady, setWebSessionReady] = useState(false);
  const [webSessionError, setWebSessionError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  const { formatted } = useLabTimer();

  // ✅ Reset navigation state when lab id changes
  useEffect(() => {
    setCurrentStep(0);
    setUserInput("");
    setFeedback(null);
    setSessionProgress(null);
    setSteps([]);
    setRevealedHints({});
    setWebSessionReady(false);
    setWebSessionError(null);
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function prepareWebSession() {
      if (!session || session.runtimeKind !== "web") {
        setWebSessionReady(false);
        setWebSessionError(null);
        return;
      }

      if (!session.containerId || !session.appUrl) {
        setWebSessionReady(false);
        setWebSessionError("Runtime started but no web session bootstrap target is available.");
        return;
      }

      setWebSessionReady(false);
      setWebSessionError(null);

      try {
        // The iframe browser navigation needs its dedicated cookie before the
        // first /lab-api/web request can succeed through the gateway.
        await bootstrapWebSession(session.containerId);

        if (!cancelled) {
          setWebSessionReady(true);
        }
      } catch (bootstrapError) {
        if (!cancelled) {
          setWebSessionError(
            getErrorMessage(bootstrapError, "Unable to prepare the web lab session.")
          );
        }
      }
    }

    void prepareWebSession();

    return () => {
      cancelled = true;
    };
  }, [session?.appUrl, session?.containerId, session?.runtimeKind, session?.sessionId]);

  // ✅ Clamp currentStep when steps change (avoid "no step" when index is out of range)
  useEffect(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
      setUserInput("");
      setFeedback(null);
    }
  }, [steps.length, currentStep]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    const routeId = id; // ✅ now a stable string in this scope

    async function run(labRouteId: string) {
      setLoading(true);
      setError(null);

      try {
        if (mockUI) {
          const mockLab = buildMockLab(labRouteId);
          const mockSteps = buildMockSteps(labRouteId);

          if (cancelled) return;
          setLab(mockLab);
          setSession({
            labId: mockLab.lab_id,
            sessionId: "mock-session",
          });
          setSteps(mockSteps);
          setLoading(false);
          return;
        }

        // ✅ REAL MODE
        const labData = await getLab(labRouteId);
        if (cancelled) return;
        setLab(labData);

        const runtime = await fetchSessionRuntime(labData.lab_id);
        if (cancelled) return;
        setSession(runtime);

        const rawSteps = await getSteps(labData.lab_id);
        if (cancelled) return;

        const enrichedSteps: LabStep[] = await Promise.all(
          rawSteps.map(async (step, index: number) => {
            const hints = step?.step_id ? await getHints(labData.lab_id, step.step_id) : [];
            return normalizeRuntimeStep({ ...step, hints }, index);
          })
        );
        if (cancelled) return;
        setSteps(enrichedSteps);

        const progress = await getSessionProgress(runtime.sessionId!);
        if (cancelled) return;
        setSessionProgress(progress);
        setCurrentStep(Math.max(0, (progress.current_step ?? 1) - 1));

        const hintsByStep: Record<number, LabStep["hints"]> = {};
        const usedKeys = Array.isArray(progress.hints_used) ? progress.hints_used : [];
        for (const step of enrichedSteps) {
          const stepNumber = step.step_number ?? 0;
          const shown = (step.hints || []).filter((hint) =>
            usedKeys.includes(`${stepNumber}_${hint.hint_number}`)
          );
          hintsByStep[stepNumber] = shown;
        }
        setRevealedHints(hintsByStep);

        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        const msg = getErrorMessage(e, "Failed to load session");
        console.error("❌ LabSession error:", e);
        setError(msg);
        setLoading(false);
      }
    }

    run(routeId);
    return () => {
      cancelled = true;
    };
  }, [id, mockUI]);

  const unlockedStepIndex = useMemo(
    () => Math.max(0, (sessionProgress?.current_step ?? 1) - 1),
    [sessionProgress]
  );
  const progressRatio = useMemo(
    () =>
      steps.length > 0
        ? (sessionProgress?.completed_steps?.length ?? 0) / steps.length
        : 0,
    [sessionProgress, steps.length]
  );
  const labName = useMemo(() => lab?.name ?? "Untitled Lab", [lab]);
  const current = useMemo(() => steps[currentStep], [steps, currentStep]);
  const currentHints = useMemo(
    () => (current?.step_number ? revealedHints[current.step_number] || [] : []),
    [current, revealedHints]
  );
  const runtimeKind = useMemo(() => {
    if (session?.runtimeKind) return session.runtimeKind;
    if (lab && "lab_delivery" in lab && lab.lab_delivery) return lab.lab_delivery;
    return "terminal";
  }, [lab, session?.runtimeKind]);
  const webAppUrl = session?.appUrl ?? null;


  if (loading) {
    return (
      <div className="min-h-[70vh] text-white flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-sm">Loading session…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] text-white flex items-center justify-center text-center p-8">
        <div className="space-y-3 max-w-2xl">
          <div className="text-xl font-semibold text-white">Session failed to load</div>
          <div className="text-xs text-white/60 whitespace-pre-wrap">{error}</div>

          <button
            onClick={() => navigate("/learner/dashboard")}
            className="mt-4 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!lab || !session) {
    return (
      <div className="min-h-[70vh] text-white flex items-center justify-center">
        <div className="text-white/60">No session data.</div>
      </div>
    );
  }


  if (!current) {
    return (
      <div className="min-h-[70vh] text-white flex items-center justify-center text-center p-8">
        <div className="space-y-4">
          <div className="text-xl font-semibold text-white">
            This lab has no interactive steps yet.
          </div>
          <button
            onClick={() => navigate("/learner/dashboard")}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#2AA7FF] via-[#7A2CF3] to-[#FF8C4A] hover:opacity-90 transition"
            type="button"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleValidate = async () => {
    if (mockUI) {
      setFeedback("Submitted in mock mode.");
      return;
    }
    if (!current.has_validation) return;
    if (!session?.sessionId || !current.step_number) return;

    try {
      const result = await validateSessionStep(
        session.sessionId,
        current.step_number,
        userInput.trim()
      );
      const pointsEarned = Number(result?.points_earned ?? 0);
      setFeedback(`✅ Correct answer. +${pointsEarned} pts`);
      const progress = await getSessionProgress(session.sessionId);
      setSessionProgress(progress);
      setUserInput("");
      setCurrentStep(Math.max(0, (progress.current_step ?? 1) - 1));
    } catch (e) {
      const msg = getErrorMessage(e, "Incorrect answer.");
      setFeedback(`❌ ${msg}`);
    }
  };

  const handleHint = async () => {
    if (mockUI) {
      const next = (current.hints || [])[0];
      setFeedback(next ? `💡 ${next.text}` : "No hint available.");
      return;
    }
    if (!current.has_validation) {
      setFeedback("💡 No hint workflow is defined for this step.");
      return;
    }
    if (!session?.sessionId || !current.step_number) return;

    const usedForStep = revealedHints[current.step_number] || [];
    const nextHint = (current.hints || []).find(
      (hint) => !usedForStep.some((used) => used?.hint_number === hint.hint_number)
    );

    if (!nextHint) {
      setFeedback("💡 No more hints available for this step.");
      return;
    }

    try {
      const result = await requestSessionHint(
        session.sessionId,
        current.step_number,
        nextHint.hint_number
      );
      const hintText = result?.hint ?? nextHint.text;
      const cost = Number(result?.cost ?? nextHint.cost ?? 0);
      setRevealedHints((prev) => ({
        ...prev,
        [current.step_number!]: [...usedForStep, { ...nextHint, text: hintText, cost }],
      }));
      const progress = await getSessionProgress(session.sessionId);
      setSessionProgress(progress);
      setFeedback(`💡 Hint unlocked (-${cost} pts)`);
    } catch (e) {
      const msg = getErrorMessage(e, "Hint request failed.");
      setFeedback(`❌ ${msg}`);
    }
  };

  const handleEndSession = async () => {
    if (!mockUI && session?.sessionId) {
      try {
        await stopSession(session.sessionId);
      } catch (e) {
        console.error("Failed to stop session before exit:", e);
      } finally {
        clearStoredSessionId(session.labId);
      }
    }

    navigate("/learner/dashboard");
  };

  const handleResumeLater = () => {
    navigate("/learner/dashboard");
  };

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#0E1323] px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <LabHeader
          labName={labName}
          onExit={handleEndSession}
          onResumeLater={handleResumeLater}
          timer={formatted}
        />
      </div>

      {/* GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 p-6">
        {/* LEFT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6">
          <LabInstructions
            stepIndex={currentStep}
            totalSteps={steps.length}
            unlockedStepIndex={unlockedStepIndex}
            step={current}
            userInput={userInput}
            onChangeInput={setUserInput}
            onValidate={handleValidate}
            onHint={handleHint}
            feedback={feedback}
            currentScore={sessionProgress?.score}
            maxScore={sessionProgress?.max_score}
            revealedHints={currentHints}
          />

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <button
              disabled={currentStep === 0}
              onClick={() => {
                setFeedback(null);
                setUserInput("");
                setCurrentStep((s) => Math.max(0, s - 1));
              }}
              className={`px-3 py-1 rounded-md border border-white/10 ${
                currentStep === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
              }`}
              type="button"
            >
              ← Prev
            </button>

            <div>
              Step {currentStep + 1} / {steps.length}
            </div>

            <button
              disabled={currentStep === steps.length - 1}
              onClick={() => {
                if (currentStep >= unlockedStepIndex) return;
                setFeedback(null);
                setUserInput("");
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
              }}
              className={`px-3 py-1 rounded-md border border-white/10 ${
                currentStep === steps.length - 1 || currentStep >= unlockedStepIndex
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-white/5"
              }`}
              type="button"
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="text-sm font-medium text-white flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              <span>Progress</span>
              <span className="text-slate-400 text-xs">
                ({sessionProgress?.completed_steps?.length ?? 0}/{steps.length} completed)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
              <div
                className="h-2 bg-gradient-to-r from-sky-400 via-purple-400 to-orange-400 transition-all duration-300"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6 flex flex-col">
          {runtimeKind === "web" ? (
            <div className="flex h-full flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Lab Application</h2>
                <p className="mt-1 text-sm text-slate-400">
                  This lab exposes a web interface instead of a terminal.
                </p>
              </div>

              {webAppUrl ? (
                <>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span className="truncate">{webAppUrl}</span>
                    {webSessionReady ? (
                      <a
                        href={webAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-white/10 px-3 py-1 text-white hover:bg-white/5"
                      >
                        Open in new tab
                      </a>
                    ) : null}
                  </div>
                  {webSessionError ? (
                    <div className="flex min-h-[28rem] flex-1 items-center justify-center rounded-lg border border-dashed border-red-500/30 bg-red-500/5 p-6 text-sm text-red-200">
                      {webSessionError}
                    </div>
                  ) : webSessionReady ? (
                    <iframe
                      src={webAppUrl}
                      title={`${labName} application`}
                      className="min-h-[28rem] w-full flex-1 rounded-lg border border-white/10 bg-white"
                    />
                  ) : (
                    <div className="flex min-h-[28rem] flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-slate-400">
                      Preparing secure web session...
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-[28rem] flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm text-slate-400">
                  Runtime started but no `app_url` was returned by the backend.
                </div>
              )}
            </div>
          ) : (
            <Terminal
              step={current}
              sessionId={session?.sessionId ?? ""}
              token={getAuthToken() ?? ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}
