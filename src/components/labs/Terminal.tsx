/**
 * @file UI component providing an interactive terminal using xterm.js
 * for executing lab commands within an Altair lab step.
 *
 * @packageDocumentation
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "xterm/css/xterm.css";

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
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(async () => {
    // Prevent connecting with invalid session/token
    if (!sessionId || !token) {
      setStatus("error");
      xtermRef.current?.writeln("\r\n\x1b[31m Missing session ID or authentication token\x1b[0m");
      return;
    }

    // Prevent double connections
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    try {
      setStatus("connecting");
      xtermRef.current?.writeln("\r\n\x1b[33m Connecting to terminal...\x1b[0m");

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
      ws.binaryType = "arraybuffer"; // Expect binary data
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        xtermRef.current?.writeln("\r\n\x1b[32m Connected to terminal\x1b[0m\r\n");
      };

      ws.onmessage = (event) => {
        const data = event.data;
        // Handle different data types (string, Blob, ArrayBuffer)
        if (typeof data === "string") {
          xtermRef.current?.write(data);
        } else if (data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          xtermRef.current?.write(decoder.decode(data));
        } else if (data instanceof Blob) {
          data.text().then((text) => {
            xtermRef.current?.write(text);
          });
        }
      };

      ws.onerror = () => {
        setStatus("error");
        xtermRef.current?.writeln("\r\n\x1b[31m WebSocket error\x1b[0m");
      };

      ws.onclose = () => {
        setStatus("disconnected");
        xtermRef.current?.writeln("\r\n\x1b[33m Disconnected from terminal\x1b[0m");
        wsRef.current = null;
      };
    } catch (err) {
      setStatus("error");
      xtermRef.current?.writeln(
        `\r\n\x1b[31m❌ Connection failed: ${err instanceof Error ? err.message : "Unknown error"}\x1b[0m`
      );
    }
  }, [sessionId, token]);

  // Initialize xterm.js (runs only once on mount)
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "transparent",
        foreground: "#e4e4e7",
        cursor: "#38bdf8",
        cursorAccent: "#0f172a",
        selectionBackground: "#38bdf8",
        selectionForeground: "#0f172a",
        black: "#18181b",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#facc15",
        blue: "#60a5fa",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#e4e4e7",
        brightBlack: "#52525b",
        brightRed: "#fca5a5",
        brightGreen: "#86efac",
        brightYellow: "#fde047",
        brightBlue: "#93c5fd",
        brightMagenta: "#d8b4fe",
        brightCyan: "#67e8f9",
        brightWhite: "#fafafa",
      },
      allowProposedApi: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    xterm.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Write welcome message
    xterm.writeln("\x1b[36m╔══════════════════════════════════════════╗\x1b[0m");
    xterm.writeln("\x1b[36m║\x1b[0m       \x1b[1;35mAltair Interactive Terminal\x1b[0m        \x1b[36m║\x1b[0m");
    xterm.writeln("\x1b[36m╚══════════════════════════════════════════╝\x1b[0m");

    // Handle user input -> send to WebSocket as binary
    xterm.onData((data) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Convert string to binary (Uint8Array) for the WebSocket
        const encoder = new TextEncoder();
        wsRef.current.send(encoder.encode(data));
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      wsRef.current?.close();
      xterm.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, []); // Empty deps - only run once on mount

  // Connect WebSocket when sessionId/token are available
  useEffect(() => {
    if (!xtermRef.current || !sessionId || !token) return;

    // Small delay to ensure terminal is ready
    const timer = setTimeout(() => {
      connectWebSocket();
    }, 100);

    return () => clearTimeout(timer);
  }, [sessionId, token, connectWebSocket]);

  // Refit terminal when container might have changed size
  useEffect(() => {
    const timer = setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const statusColor = {
    connecting: "text-yellow-300",
    connected: "text-green-300",
    disconnected: "text-white/45",
    error: "text-red-300",
  };

  return (
    <div className="h-full rounded-3xl border border-white/10 bg-[#0c0c0f] backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
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
          {status === "error" && (
            <button
              onClick={connectWebSocket}
              className="ml-2 underline hover:text-white/70"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Terminal Container */}
      <div
        ref={terminalRef}
        className="flex-1 p-2 overflow-hidden"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}