import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { createReport } from "@/api/moderation";

type ReportTargetType = "user" | "lab" | "group" | "starpath" | "marketplace" | "gamification";

type ReportButtonProps = {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
  className?: string;
  compact?: boolean;
};

const BASE_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60";

const COMPACT_BUTTON =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/10 text-rose-100 transition hover:border-rose-200/35 hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-60";

export default function ReportButton({
  targetType,
  targetId,
  targetLabel,
  className,
  compact = false,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setError("Add a short reason before submitting.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await createReport({
        target_type: targetType,
        target_id: targetId,
        reason: trimmedReason,
        details: details.trim() || undefined,
        priority,
      });
      setSent(true);
      setReason("");
      setDetails("");
      window.setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        className={[compact ? COMPACT_BUTTON : BASE_BUTTON, className].filter(Boolean).join(" ")}
        title={`Report ${targetLabel ?? targetType}`}
      >
        <AlertTriangle className="h-4 w-4" />
        {compact ? null : "Report"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Report content</p>
                <p className="mt-1 text-sm text-white/45">
                  {targetLabel ?? targetType} · {targetId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60"
              >
                Close
              </button>
            </div>

            {sent ? (
              <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Report submitted to moderation.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <label className="block space-y-1.5 text-sm text-white/60">
                  <span>Reason</span>
                  <input
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f1422] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-rose-300/60"
                    placeholder="Broken content, abuse, access issue..."
                  />
                </label>
                <label className="block space-y-1.5 text-sm text-white/60">
                  <span>Priority</span>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as typeof priority)}
                    className="w-full rounded-xl border border-white/15 bg-[#0f1422] px-3 py-2.5 text-sm text-white outline-none focus:border-rose-300/60"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label className="block space-y-1.5 text-sm text-white/60">
                  <span>Details</span>
                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/15 bg-[#0f1422] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-rose-300/60"
                    placeholder="What happened? Add steps or context for the admin team."
                  />
                </label>
                {error ? <p className="text-sm text-rose-200">{error}</p> : null}
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving}
                  className="w-full rounded-xl border border-rose-300/30 bg-rose-400/15 px-4 py-2.5 text-sm font-semibold text-rose-100 disabled:opacity-60"
                >
                  {saving ? "Submitting..." : "Submit report"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
