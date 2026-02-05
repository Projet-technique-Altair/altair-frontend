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

import { getLab } from "@/api/labs";
import type { Lab } from "@/contracts/labs";

import LabHeader from "@/components/labs/LabHeader";
import LabInstructions from "@/components/labs/LabInstructions";
import Terminal from "@/components/labs/Terminal";
import { useLabTimer } from "@/hooks/useLabTimer";

/* =========================
   Types (UI runtime)
========================= */

type LabStep = {
  title: string;
  instruction: string;
  expected?: string;
  hint?: string;
  solution?: string;
};

type SessionRuntime = {
  sessionId?: string;
  labId: string;
  steps: LabStep[];
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
        name: "Lab — In Progress",
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
        expected: "ALTAIR{done}",
        hint: "Just type the exact flag for mock.",
        solution: "ALTAIR{done}",
      },
    ];
  }

  // default = in progress
  return [
    {
      title: "Warmup — Environment check",
      instruction: "Type `whoami` in the terminal and copy the output.",
      expected: "whoami",
      hint: "Basic Linux identity command.",
      solution: "whoami",
    },
    {
      title: "Recon — Find the target",
      instruction: "List files in the current directory using `ls -la`.",
      expected: "ls -la",
      hint: "Use ls with long format + show hidden.",
      solution: "ls -la",
    },
    {
      title: "Validate — Submit the flag",
      instruction:
        "When you find the flag, paste it here (example: `ALTAIR{...}`).\n\nFor mock, just type `ALTAIR{mock_flag}`.",
      expected: "ALTAIR{mock_flag}",
      hint: "In real labs, flags are usually inside a file or an env variable.",
      solution: "ALTAIR{mock_flag}",
    },
  ];
}

/* =========================
   Helpers: auth + base url
========================= */

function getAuthToken(): string | null {
  return localStorage.getItem("altair_token");
}

function getApiBase(): string {
  return (
    (import.meta as any).env?.VITE_API_URL ??
    (import.meta as any).env?.VITE_GATEWAY_URL ??
    ""
  );
}

/* =========================
   Helpers: extract steps from JSON
========================= */

function asArray(x: any): any[] | null {
  return Array.isArray(x) ? x : null;
}

function tryJsonParse(x: any): any | null {
  if (typeof x !== "string") return null;
  try {
    return JSON.parse(x);
  } catch {
    return null;
  }
}

function normalizeStep(raw: any, index: number): LabStep {
  const title =
    raw?.title ??
    raw?.name ??
    raw?.label ??
    raw?.question_title ??
    `Step ${index + 1}`;

  const instruction =
    raw?.instruction ??
    raw?.prompt ??
    raw?.question ??
    raw?.text ??
    raw?.body ??
    "No instruction provided.";

  const expected =
    raw?.expected ??
    raw?.expected_answer ??
    raw?.expectedAnswer ??
    raw?.answer ??
    raw?.expected_output ??
    raw?.expectedOutput ??
    undefined;

  const hint = raw?.hint ?? raw?.clue ?? raw?.tips ?? undefined;
  const solution = raw?.solution ?? raw?.solve ?? raw?.explanation ?? undefined;

  return {
    title: String(title),
    instruction: String(instruction),
    expected: expected != null ? String(expected) : undefined,
    hint: hint != null ? String(hint) : undefined,
    solution: solution != null ? String(solution) : undefined,
  };
}

function extractStepsFromPayload(payload: any): LabStep[] {
  const candidates: any[] = [];

  candidates.push(payload?.steps);
  candidates.push(payload?.questions);
  candidates.push(payload?.data?.steps);
  candidates.push(payload?.data?.questions);
  candidates.push(payload?.runtime?.steps);
  candidates.push(payload?.runtime?.questions);
  candidates.push(payload?.data?.runtime?.steps);
  candidates.push(payload?.data?.runtime?.questions);

  const q1 = tryJsonParse(payload?.questions_json);
  const q2 = tryJsonParse(payload?.data?.questions_json);
  const q3 = tryJsonParse(payload?.steps_json);
  const q4 = tryJsonParse(payload?.data?.steps_json);

  if (q1) candidates.push(q1);
  if (q2) candidates.push(q2);
  if (q3) candidates.push(q3);
  if (q4) candidates.push(q4);

  for (const c of [q1, q2, q3, q4]) {
    if (!c) continue;
    candidates.push(c?.steps);
    candidates.push(c?.questions);
    candidates.push(c?.data?.steps);
    candidates.push(c?.data?.questions);
  }

  for (const cand of candidates) {
    const arr = asArray(cand);
    if (arr && arr.length > 0) return arr.map((s, i) => normalizeStep(s, i));
  }

  return [];
}

/* =========================
   Runtime session fetcher
========================= */

type TryEndpoint = {
  method: "GET" | "POST";
  path: (labId: string) => string;
  body?: (labId: string) => any;
};

const SESSION_TRY: TryEndpoint[] = [
  { method: "GET", path: (labId) => `/sessions/labs/${labId}` },
  { method: "GET", path: (labId) => `/sessions/${labId}` },

  { method: "POST", path: () => `/sessions`, body: (labId) => ({ lab_id: labId }) },
  { method: "POST", path: (labId) => `/sessions/labs/${labId}/start`, body: () => ({}) },
];

async function fetchSessionRuntime(labId: string): Promise<SessionRuntime> {
  const base = getApiBase();
  const token = getAuthToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let lastErr: any = null;

  for (const attempt of SESSION_TRY) {
    const url = `${base}${attempt.path(labId)}`;

    try {
      const res = await fetch(url, {
        method: attempt.method,
        headers,
        body: attempt.method === "POST" ? JSON.stringify(attempt.body?.(labId) ?? {}) : undefined,
      });

      if (res.status === 401 || res.status === 403) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Unauthorized (${res.status}) at ${attempt.method} ${attempt.path(labId)}\n${text}`
        );
      }

      if (res.status === 404 || res.status === 405) {
        lastErr = new Error(`${res.status} ${attempt.method} ${attempt.path(labId)}`);
        continue;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastErr = new Error(`HTTP ${res.status} on ${attempt.method} ${attempt.path(labId)}\n${text}`);
        if (res.status >= 500) break;
        continue;
      }

      const payload = await res.json().catch(() => ({}));
      const steps = extractStepsFromPayload(payload);

      const sessionId =
        payload?.session_id ??
        payload?.sessionId ??
        payload?.data?.session_id ??
        payload?.data?.sessionId ??
        payload?.data?.id ??
        payload?.id ??
        undefined;

      const resolvedLabId =
        payload?.lab_id ??
        payload?.labId ??
        payload?.data?.lab_id ??
        payload?.data?.labId ??
        labId;

      return {
        sessionId: sessionId != null ? String(sessionId) : undefined,
        labId: String(resolvedLabId),
        steps,
      };
    } catch (e) {
      lastErr = e;
      const msg = String((e as any)?.message ?? "");
      if (msg.toLowerCase().includes("unauthorized")) break;
    }
  }

  throw lastErr ?? new Error("Unable to fetch session runtime");
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");

  const { formatted } = useLabTimer();

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        // ✅ MOCK MODE: NO BACKEND CALLS AT ALL
        if (mockUI) {
          const mockLab = buildMockLab(id);
          const mockSteps = buildMockSteps(id);

          if (cancelled) return;
          setLab(mockLab);
          setSession({
            labId: mockLab.lab_id,
            sessionId: "mock-session",
            steps: mockSteps,
          });
          setLoading(false);
          return;
        }

        // ✅ REAL MODE
        const labData = await getLab(id);
        if (cancelled) return;
        setLab(labData);

        const runtime = await fetchSessionRuntime(labData.lab_id);
        if (cancelled) return;

        setSession(runtime);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        const msg = (e as any)?.message ? String((e as any).message) : "Failed to load session";
        console.error("❌ LabSession error:", e);
        setError(msg);
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [id, mockUI]);

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

  const steps = session.steps ?? [];
  const current = steps[currentStep];

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

  const handleValidate = () => {
    const expected = (current.expected ?? "").trim();
    const input = userInput.trim();

    if (expected && input === expected) {
      setFeedback("Correct!");
      setTimeout(() => {
        setFeedback(null);
        setUserInput("");
        if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
        else setFeedback("Lab completed!");
      }, 900);
    } else {
      setFeedback(expected ? "Try again!" : "Submitted.");
    }
  };

  const handleHint = () => {
    setFeedback(current.hint ? `Hint: ${current.hint}` : "No hint available.");
  };

  const handleSolution = () => {
    setFeedback(current.solution ? `Solution: ${current.solution}` : "No solution provided.");
  };

  const handleEndSession = () => navigate("/learner/dashboard");

  const progressRatio = steps.length > 0 ? (currentStep + 1) / steps.length : 0;

  const labName = (lab as any).name ?? "Untitled Lab";

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* HEADER */}
      <div className="border-b border-white/5 bg-[#0E1323] px-6 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <LabHeader labName={labName} onExit={handleEndSession} timer={formatted} />
      </div>

      {/* GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 p-6">
        {/* LEFT */}
        <div className="bg-[#0E1323] border border-white/5 rounded-xl p-6">
          <LabInstructions
            stepIndex={currentStep}
            totalSteps={steps.length}
            step={current}
            userInput={userInput}
            onChangeInput={setUserInput}
            onValidate={handleValidate}
            onHint={handleHint}
            onSolution={handleSolution}
            feedback={feedback}
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
                setFeedback(null);
                setUserInput("");
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
              }}
              className={`px-3 py-1 rounded-md border border-white/10 ${
                currentStep === steps.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
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
                ({currentStep + 1}/{steps.length})
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
          <Terminal step={current} />
        </div>
      </div>
    </div>
  );
}
