// src/pages/learner/LabSession.tsx

/**
 * @file LabSession — interactive learner lab session environment.
 *
 * Behavior:
 * - Default (real): fetch lab metadata from backend + fetch runtime session from backend
 * - Mock (?mock=1): NO backend calls (no getLab, no runtime). Uses mock lab + mock steps.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { ApiError } from "@/api/client";
import { emitLabCompletionEvents } from "@/api/events";
import { getHints, getLab, getSteps, startLab } from "@/api/labs";
import {
  completeSession,
  getSession,
  openWebLabSession,
  getSessionProgress,
  requestSessionHint,
  stopSession,
  validateSessionStep,
  type SessionProgress,
} from "@/api/sessions";
import type { Lab } from "@/contracts/labs";

import LabHeader from "@/components/labs/LabHeader";
import ReportButton from "@/components/moderation/ReportButton";
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
  currentRuntimeId?: string | null;
  status?: string | null;
  runtimeKind?: string | null;
  webshellUrl?: string | null;
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

function isRuntimeUnavailableError(error: unknown): boolean {
  return error instanceof ApiError && [404, 410].includes(error.status);
}

async function classifyOpenWebConflict(sessionId: string): Promise<"starting" | "unavailable"> {
  try {
    const latest = await getSession(sessionId);
    return latest?.current_runtime_id ? "starting" : "unavailable";
  } catch {
    return "starting";
  }
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
      const currentRuntimeId = existing?.current_runtime_id ?? null;
      const runtimeKind = existing?.runtime_kind ?? null;
      const webshellUrl = existing?.webshell_url ?? null;

      if (status === "completed") {
        clearStoredSessionId(labId);
      } else if (currentRuntimeId || webshellUrl) {
        return {
          sessionId: cached,
          labId,
          currentRuntimeId,
          status,
          runtimeKind,
          webshellUrl,
        };
      }
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
    currentRuntimeId: started?.current_runtime_id ?? null,
    status: started?.status ?? null,
    runtimeKind: started?.runtime_kind ?? null,
    webshellUrl: started?.webshell_url ?? null,
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

  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [completionInFlight, setCompletionInFlight] = useState(false);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [runtimeUnavailable, setRuntimeUnavailable] = useState(false);
  const [runtimeRestarting, setRuntimeRestarting] = useState(false);
  const webLabWindowRef = useRef<Window | null>(null);

  const { formatted } = useLabTimer(sessionProgress?.time_elapsed ?? 0);

  // ✅ Reset navigation state when lab id changes
  useEffect(() => {
    setCurrentStep(0);
    setUserInput("");
    setFeedback(null);
    setSessionProgress(null);
    setSteps([]);
    setRevealedHints({});
    setCompletionInFlight(false);
    setCompletedSessionId(null);
    setRuntimeUnavailable(false);
    setRuntimeRestarting(false);
    webLabWindowRef.current = null;
  }, [id]);

  useEffect(() => {
    if (session?.currentRuntimeId) {
      setRuntimeUnavailable(false);
    }
  }, [session?.currentRuntimeId]);

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
            currentRuntimeId: "mock-runtime",
            runtimeKind: "terminal",
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
  const isWebRuntime = runtimeKind === "web";

  const bootstrapAndOpenWebLab = async (
    sessionId: string,
    options: { reuseExistingTab: boolean }
  ) => {
    const { reuseExistingTab } = options;
    const reusableWindow =
      reuseExistingTab && webLabWindowRef.current && !webLabWindowRef.current.closed
        ? webLabWindowRef.current
        : null;

    let targetWindow: Window | null = reusableWindow;
    let openedNewWindow = false;

    if (!targetWindow) {
      targetWindow = window.open("", "_blank");
      if (!targetWindow) {
        throw new Error("Browser blocked the new tab.");
      }

      openedNewWindow = true;
      targetWindow.document.write("Opening web lab...");
      webLabWindowRef.current = targetWindow;
    }

    try {
      const result = await openWebLabSession(sessionId);
      if (!result?.redirect_url) {
        throw new Error("Missing redirect_url from backend.");
      }

      targetWindow.location.replace(result.redirect_url);
      webLabWindowRef.current = targetWindow;
    } catch (error) {
      if (openedNewWindow) {
        targetWindow.close();
        webLabWindowRef.current = null;
      }
      throw error;
    }
  };

  const handleOpenWebLab = async () => {
    if (!session?.sessionId) {
      setFeedback("❌ No session id available for the web launcher.");
      return;
    }

    if (!session.currentRuntimeId) {
      handleRuntimeUnavailable();
      return;
    }
    try {
      await bootstrapAndOpenWebLab(session.sessionId, { reuseExistingTab: true });
      setRuntimeUnavailable(false);
      setFeedback("✅ Web lab opened.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const conflictState = await classifyOpenWebConflict(session.sessionId);
        if (conflictState === "unavailable") {
          handleRuntimeUnavailable();
        } else {
          setFeedback("⚠️ Runtime is starting. Retry in a few seconds.");
        }
        return;
      }
      if (isRuntimeUnavailableError(e)) {
        handleRuntimeUnavailable();
        return;
      }
      const msg = getErrorMessage(e, "Failed to open web lab.");
      setFeedback(`❌ ${msg}`);
    }
  };

  useEffect(() => {
    const sessionId = session?.sessionId;
    const labId = session?.labId;

    if (mockUI || !sessionId || !labId || !sessionProgress || steps.length === 0) return;
    if (completionInFlight || completedSessionId === sessionId) return;

    const activeSessionId = sessionId;
    const activeLabId = labId;

    const completedSteps = sessionProgress.completed_steps?.length ?? 0;
    if (completedSteps !== steps.length) return;

    let cancelled = false;

    async function finalizeSession() {
      setCompletionInFlight(true);

      try {
        const stats = await completeSession(activeSessionId);
        if (cancelled) return;

        const liveLab = mockUI ? null : (lab as Lab | null);

        try {
          await emitLabCompletionEvents({
            sessionId: activeSessionId,
            labId: activeLabId,
            durationSeconds: stats.completion_time_seconds,
            totalAttempts: stats.total_attempts,
            hintsUsed: stats.hints_used,
            totalSteps: steps.length,
            labType: liveLab?.lab_type,
            labFamily: liveLab?.lab_family,
            labDelivery: liveLab?.lab_delivery,
          });
        } catch (eventError) {
          console.warn("Gamification completion events failed:", eventError);
        }

        clearStoredSessionId(activeLabId);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: "completed",
                currentRuntimeId: null,
                webshellUrl: null,
              }
            : prev
        );
        setCompletedSessionId(activeSessionId);
        setFeedback(
          `✅ Lab completed. Final score: ${stats.final_score}/${stats.max_score}`
        );
        setRuntimeUnavailable(false);
      } catch (e) {
        if (cancelled) return;

        const msg = getErrorMessage(e, "Failed to mark the lab as completed.");
        setFeedback(`⚠️ All steps are done, but completion failed: ${msg}`);
      } finally {
        if (!cancelled) setCompletionInFlight(false);
      }
    }

    finalizeSession();

    return () => {
      cancelled = true;
    };
  }, [
    mockUI,
    session?.sessionId,
    session?.labId,
    sessionProgress,
    steps.length,
    lab,
    completionInFlight,
    completedSessionId,
  ]);


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

  const handleRuntimeUnavailable = () => {
    setRuntimeUnavailable(true);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            currentRuntimeId: null,
            webshellUrl: null,
          }
        : prev
    );
    setFeedback("⚠️ Lab arrêté.");
  };

  const handleRelaunchRuntime = async () => {
    if (mockUI || !lab) return;

    setRuntimeRestarting(true);
    setFeedback(null);

    try {
      const restarted = await startLab(lab.lab_id);
      const nextSessionId = restarted?.session_id;

      if (!nextSessionId) {
        throw new Error("Start succeeded but did not return a session_id");
      }

      storeSessionId(lab.lab_id, nextSessionId);

      setSession({
        sessionId: nextSessionId,
        labId: lab.lab_id,
        currentRuntimeId: restarted?.current_runtime_id ?? null,
        status: restarted?.status ?? null,
        runtimeKind: restarted?.runtime_kind ?? null,
        webshellUrl: restarted?.webshell_url ?? null,
      });

      const progress = await getSessionProgress(nextSessionId);
      setSessionProgress(progress);
      setRuntimeUnavailable(false);

      if (restarted?.runtime_kind === "web") {
        await bootstrapAndOpenWebLab(nextSessionId, { reuseExistingTab: true });
        setFeedback("✅ Lab restarted and web tab reloaded.");
      } else {
        setFeedback("✅ Lab restarted.");
      }
    } catch (e) {
      if (isRuntimeUnavailableError(e)) {
        setFeedback("⚠️ Runtime is restarting. Retry in a few seconds.");
        return;
      }
      const msg = getErrorMessage(e, "Failed to restart the lab.");
      setFeedback(`❌ ${msg}`);
    } finally {
      setRuntimeRestarting(false);
    }
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
          action={
            !mockUI && lab?.lab_id ? (
              <ReportButton
                targetType="lab"
                targetId={lab.lab_id}
                targetLabel={labName}
                compact
              />
            ) : undefined
          }
        />
      </div>

      {/* GRID */}
      <div
        className={`flex-1 grid grid-cols-1 gap-6 p-6 ${
          isWebRuntime ? "" : "lg:grid-cols-[1fr_1.2fr]"
        }`}
      >
        {/* LEFT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6">
          {isWebRuntime && (
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Web Lab</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Keep this page open for hints and answers. The lab application opens in a
                  separate tab.
                </p>
              </div>

              {runtimeUnavailable || !session.currentRuntimeId ? (
                <button
                  type="button"
                  onClick={handleRelaunchRuntime}
                  disabled={runtimeRestarting}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runtimeRestarting ? "Restarting..." : "Relancer le lab"}
                </button>
              ) : session?.sessionId ? (
                <button
                  type="button"
                  onClick={handleOpenWebLab}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                >
                  Open Web Lab
                </button>
              ) : (
                <div className="text-sm text-slate-500">
                  Runtime started but no session id was available for the web launcher.
                </div>
              )}
            </div>
          )}

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
        {!isWebRuntime && (
          <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6 flex flex-col">
            {runtimeUnavailable || !session.currentRuntimeId ? (
              <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-[#0c0c0f] p-8 text-center">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">Lab arrêté</h2>
                  <p className="text-sm text-white/60">
                    The runtime is no longer available. Restart it to keep working on the same
                    session.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRelaunchRuntime}
                  disabled={runtimeRestarting}
                  className="rounded-md border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runtimeRestarting ? "Restarting..." : "Relancer le lab"}
                </button>
              </div>
            ) : (
              <Terminal
                key={`${session.sessionId}:${session.currentRuntimeId}`}
                step={current}
                sessionId={session?.sessionId ?? ""}
                token={getAuthToken() ?? ""}
                onRuntimeUnavailable={handleRuntimeUnavailable}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
