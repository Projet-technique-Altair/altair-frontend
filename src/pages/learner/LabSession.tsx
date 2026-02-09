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
  webshellUrl?: string;
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
  return sessionStorage.getItem("altair_token");
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

/*async function fetchJson(res: Response) {
  const text = await res.text().catch(() => "");
  return text ? JSON.parse(text) : {};
}*/

async function fetchJson(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}


async function fetchSessionRuntime(labId: string): Promise<SessionRuntime> {
  const base = getApiBase();
  const token = getAuthToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 0) Resume by stored sessionId (no "list all sessions")
  const cached = getStoredSessionId(labId);
  if (cached) {
    const getUrl = `${base}/sessions/sessions/${cached}`;
    const getRes = await fetch(getUrl, { method: "GET", headers });

    if (getRes.ok) {
  const payload = await fetchJson(getRes);
  const webshellUrl = payload?.data?.webshell_url ?? payload?.webshell_url;
  return { sessionId: cached, labId, steps: extractStepsFromPayload(payload), webshellUrl };
    }

    // session not found/invalid -> forget and start again
    if (getRes.status === 404) clearStoredSessionId(labId);

    // if 401/403, throw (auth issue)
    if (getRes.status === 401 || getRes.status === 403) {
      const text = await getRes.text().catch(() => "");
      throw new Error(`Unauthorized (${getRes.status}) on GET /sessions/sessions/${cached}\n${text}`);
    }
  }

  // 1) POST start (doit réussir)
  const startUrl = `${base}/sessions/labs/${labId}/start`;
  const startRes = await fetch(startUrl, { method: "POST", headers, body: JSON.stringify({}) });

  /*if (!startRes.ok) {
    const text = await startRes.text().catch(() => "");
    throw new Error(`HTTP ${startRes.status} on POST /start\n${text}`);
  }*/

  if (startRes.status === 409) {
    // ✅ Session already exists: backend should tell us which one
    const conflictPayload = await fetchJson(startRes);

    const existingSessionId =
      conflictPayload?.session_id ??
      conflictPayload?.sessionId ??
      conflictPayload?.data?.session_id ??
      conflictPayload?.data?.sessionId ??
      conflictPayload?.data?.id ??
      conflictPayload?.id ??
      undefined;

    if (!existingSessionId) {
      throw new Error(
        "409 Conflict: session already exists, but backend did not return session_id. " +
          "Add session_id in 409 response body or provide a 'get active session for lab' endpoint."
      );
    }

    const sessionId = String(existingSessionId);
    storeSessionId(labId, sessionId);

    // Then GET the session runtime
    const getUrl = `${base}/sessions/sessions/${sessionId}`;
    const getRes = await fetch(getUrl, { method: "GET", headers });

    if (!getRes.ok) {
      const text = await getRes.text().catch(() => "");
      throw new Error(`HTTP ${getRes.status} on GET /sessions/${sessionId}\n${text}`);
    }

    const payload = await fetchJson(getRes);
    const webshellUrl = payload?.data?.webshell_url ?? payload?.webshell_url;
    return { sessionId, labId, steps: extractStepsFromPayload(payload), webshellUrl };
  }

  if (!startRes.ok) {
    const text = await startRes.text().catch(() => "");
    throw new Error(`HTTP ${startRes.status} on POST /start\n${text}`);
  }


  const startPayload = await fetchJson(startRes);

  const sessionIdFromStart =
    startPayload?.session_id ??
    startPayload?.sessionId ??
    startPayload?.data?.session_id ??
    startPayload?.data?.sessionId ??
    startPayload?.data?.id ??
    startPayload?.id ??
    undefined;

  if (!sessionIdFromStart) {
    throw new Error("Start succeeded but did not return a session_id");
  }

  const sessionId = String(sessionIdFromStart);
  storeSessionId(labId, sessionId);

  // If start already includes steps/runtime, return directly
  const stepsFromStart = extractStepsFromPayload(startPayload);
  if (stepsFromStart.length > 0) {
    return { sessionId, labId, steps: stepsFromStart };
  }

  // 2) GET after POST succeeded
  const getUrl = `${base}/sessions/sessions/${sessionId}`;
  const getRes = await fetch(getUrl, { method: "GET", headers });

  if (!getRes.ok) {
    const text = await getRes.text().catch(() => "");
    throw new Error(`HTTP ${getRes.status} on GET /sessions/sessions/${sessionId}\n${text}`);
  }

  const payload = await fetchJson(getRes);
  const webshellUrl = payload?.data?.webshell_url ?? payload?.webshell_url;
  return { sessionId, labId, steps: extractStepsFromPayload(payload), webshellUrl };
}




//WORKS TECHNICALLY
/*async function fetchSessionRuntime(labId: string): Promise<SessionRuntime> {
  const base = getApiBase();
  const token = getAuthToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  //Need to add a verification to see if the session is already running or not

  // 1) POST start (doit réussir)
  const startUrl = `${base}/sessions/labs/${labId}/start`;
  const startRes = await fetch(startUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({}), // ou { lab_id: labId } si ton backend le demande
  });

  if (!startRes.ok) {
    const text = await startRes.text().catch(() => "");
    throw new Error(`HTTP ${startRes.status} on POST /start\n${text}`);
  }

  const startPayload = await startRes.json().catch(() => ({}));

  // Si le POST renvoie déjà les steps/runtime → parfait, on retourne direct
  const stepsFromStart = extractStepsFromPayload(startPayload);
  const sessionIdFromStart =
    startPayload?.session_id ??
    startPayload?.sessionId ??
    startPayload?.data?.session_id ??
    startPayload?.data?.sessionId ??
    startPayload?.data?.id ??
    startPayload?.id ??
    undefined;

  const resolvedLabId =
    startPayload?.lab_id ??
    startPayload?.labId ??
    startPayload?.data?.lab_id ??
    startPayload?.data?.labId ??
    labId;

  if (stepsFromStart.length > 0) {
    return {
      sessionId: sessionIdFromStart != null ? String(sessionIdFromStart) : undefined,
      labId: String(resolvedLabId),
      steps: stepsFromStart,
    };
  }

  // 2) Sinon → GET par sessionId (uniquement après POST réussi)
  if (!sessionIdFromStart) {
    throw new Error("Start succeeded but did not return a session_id");
  }

  const sessionId = String(sessionIdFromStart);
  const getUrl = `${base}/sessions/sessions/${sessionId}`;

  const getRes = await fetch(getUrl, {
    method: "GET",
    headers,
  });

  if (!getRes.ok) {
    const text = await getRes.text().catch(() => "");
    throw new Error(`HTTP ${getRes.status} on GET /sessions/${sessionId}\n${text}`);
  }

  const payload = await getRes.json().catch(() => ({}));
  const steps = extractStepsFromPayload(payload);

  return {
    sessionId,
    labId: String(
      payload?.lab_id ??
        payload?.labId ??
        payload?.data?.lab_id ??
        payload?.data?.labId ??
        resolvedLabId
    ),
    steps,
  };
}*/


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

  // ✅ Compute steps early so other hooks (useEffect) can depend on it safely
  const steps = useMemo<LabStep[]>(() => {
    if (!lab) return [];
    const fromLab = extractStepsFromPayload(lab as any);
    const fromSession = session?.steps ?? [];
    return fromSession.length > 0 ? fromSession : fromLab;
  }, [lab, session]);


  // ✅ Reset navigation state when lab id changes
  useEffect(() => {
    setCurrentStep(0);
    setUserInput("");
    setFeedback(null);
  }, [id]);

  // ✅ Clamp currentStep when steps change (avoid "no step" when index is out of range)
  useEffect(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
      setUserInput("");
      setFeedback(null);
    }
  }, [steps.length, currentStep]);



  /*useEffect(() => {
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
  }, [id, mockUI]);*/


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
            steps: mockSteps,
          });
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
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        const msg = (e as any)?.message ? String((e as any).message) : "Failed to load session";
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
          <Terminal
            step={current}
            sessionId={session?.sessionId ?? ""}
            token={getAuthToken() ?? ""}
            webshellUrl={session?.webshellUrl}
          />
        </div>
      </div>
    </div>
  );
}
