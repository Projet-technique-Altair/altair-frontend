import { useEffect, useRef, useState } from "react";
import {
  ALTAIR_TOAST_EVENT,
  type AltairToastDetail,
  type AltairToastTone,
} from "@/lib/toast";

type ToastState = {
  message: string;
  tone: AltairToastTone;
};

const TONE_STYLES: Record<AltairToastTone, string> = {
  success:
    "border-emerald-300/45 bg-[linear-gradient(135deg,rgba(16,185,129,0.34),rgba(5,14,28,0.96))] text-emerald-50 shadow-[0_18px_60px_rgba(16,185,129,0.32)]",
  error:
    "border-rose-300/45 bg-[linear-gradient(135deg,rgba(244,63,94,0.3),rgba(29,11,19,0.96))] text-rose-50 shadow-[0_18px_60px_rgba(244,63,94,0.28)]",
  info:
    "border-sky-300/45 bg-[linear-gradient(135deg,rgba(56,189,248,0.3),rgba(9,21,34,0.96))] text-sky-50 shadow-[0_18px_60px_rgba(56,189,248,0.28)]",
};

export default function GlobalToastHost() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const clearCurrentTimeout = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<AltairToastDetail>).detail;
      if (!detail?.message) {
        return;
      }

      clearCurrentTimeout();
      setToast({
        message: detail.message,
        tone: detail.tone ?? "success",
      });

      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, 2800);
    };

    window.addEventListener(ALTAIR_TOAST_EVENT, handleToast);
    return () => {
      clearCurrentTimeout();
      window.removeEventListener(ALTAIR_TOAST_EVENT, handleToast);
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 top-32 z-[200] max-w-sm">
      <div
        className={[
          "rounded-2xl border px-4 py-3 text-sm font-semibold backdrop-blur-xl transition-all duration-300",
          TONE_STYLES[toast.tone],
        ].join(" ")}
      >
        {toast.message}
      </div>
    </div>
  );
}
