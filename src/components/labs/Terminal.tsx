/**
 * @file UI component providing an interactive terminal simulation
 * for executing lab commands within an Altair lab step.
 *
 * @packageDocumentation
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Play } from "lucide-react";

export type LabStep = {
  title: string;
  instruction: string;
  expected?: string;
  hint?: string;
  solution?: string;
};

interface TerminalProps {
  step: LabStep;
  sessionId: string;
  token: string;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export default function Terminal({ sessionId, token }: TerminalProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const connectWebSocket = useCallback(async () => {
    // Prevent connecting with invalid session/token
    if (!sessionId || !token) {
      setStatus("error");
      setOutput((prev) => [
        ...prev,
        "❌ Missing session ID or authentication token",
      ]);
      return;
    }

    try {
      setStatus("connecting");

      // Get API base URL from environment
      const apiBase =
        (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_URL ??
        (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_GATEWAY_URL ??
        "";

      // Fetch session details to get WSS URL
      const response = await fetch(
        `${apiBase}/sessions/sessions/${sessionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.status}`);
      }

      const session = await response.json();
      // Extract WebSocket URL from various possible response structures
      const wssUrl =
        session.data?.webshell_url ||
        session.data?.websocket_url ||
        session.data?.wssUrl ||
        session.webshell_url ||
        session.websocket_url ||
        session.wssUrl ||
        session.websocketUrl ||
        session.url;

      if (!wssUrl) {
        throw new Error("No WebSocket URL found in session");
      }

      // Connect to WebSocket
      const ws = new WebSocket(wssUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        setOutput((prev) => [...prev, "🔗 Connected to terminal"]);
      };

      ws.onmessage = (event) => {
        const data = event.data;
        // Handle different data types (string, Blob, ArrayBuffer)
        if (typeof data === "string") {
          // Split by newlines and add each line separately
          const lines = data.split("\n").filter((l) => l.length > 0);
          setOutput((prev) => [...prev, ...lines]);
        } else if (data instanceof Blob) {
          // Convert Blob to text
          data.text().then((text) => {
            const lines = text.split("\n").filter((l) => l.length > 0);
            setOutput((prev) => [...prev, ...lines]);
          });
        } else {
          // Fallback: convert to string
          setOutput((prev) => [...prev, String(data)]);
        }
      };

      ws.onerror = () => {
        setStatus("error");
        setOutput((prev) => [...prev, "❌ WebSocket error"]);
      };

      ws.onclose = () => {
        setStatus("disconnected");
        setOutput((prev) => [...prev, "🔌 Disconnected from terminal"]);
        wsRef.current = null;
      };
    } catch (err) {
      setStatus("error");
      setOutput((prev) => [
        ...prev,
        `❌ Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      ]);
    }
  }, [sessionId, token]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRun = () => {
    const trimmed = command.trim();
    if (!trimmed) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setOutput((prev) => [...prev, `$ ${trimmed}`]);
      wsRef.current.send(trimmed + "\n");
    } else {
      setOutput((prev) => [...prev, `$ ${trimmed}`, "❌ Not connected to terminal"]);
    }

    setCommand("");
  };

  const statusColor = {
    connecting: "text-yellow-300",
    connected: "text-green-300",
    disconnected: "text-white/45",
    error: "text-red-300",
  };

  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="ml-2 text-xs text-white/70 tracking-wide">
            INTERACTIVE TERMINAL
          </span>
        </div>

        <div className={`text-[11px] ${statusColor[status]}`}>
          Status: {status}
          {status === "disconnected" && (
            <button
              onClick={connectWebSocket}
              className="ml-2 underline hover:text-white/70"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto px-4 py-4 font-mono text-sm text-white/80"
      >
        {output.length === 0 ? (
          <p className="text-white/35 italic">No commands executed yet…</p>
        ) : (
          <div className="space-y-1.5">
            {output.map((line, i) => {
              // Ensure line is a string
              const lineStr = typeof line === "string" ? line : String(line);
              const isPrompt = lineStr.startsWith("$ ");
              const isOk = lineStr.startsWith("✅") || lineStr.startsWith("🔗");
              const isErr = lineStr.startsWith("❌");
              const isWarn = lineStr.startsWith("⚠️") || lineStr.startsWith("🔌");

              return (
                <div
                  key={i}
                  className={[
                    "whitespace-pre-wrap break-words",
                    isPrompt && "text-white/70",
                    isOk && "text-green-200",
                    isErr && "text-red-200",
                    isWarn && "text-yellow-200",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {lineStr}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
          <span className="font-mono text-sky-300">$</span>

          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="Type a command…"
            disabled={status !== "connected"}
            className="flex-1 bg-transparent outline-none text-sm font-mono text-white/85 placeholder:text-white/35 disabled:opacity-50"
          />

          <button
            onClick={handleRun}
            type="button"
            disabled={status !== "connected"}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Run command"
            title="Run"
          >
            <Play className="h-3.5 w-3.5" />
            Run
          </button>
        </div>
      </div>
    </div>
  );
}