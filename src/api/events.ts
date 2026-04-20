import { request } from "@/api/client";

type GamificationEventPayload = {
  event_id: string;
  event_type: string;
  meta?: Record<string, unknown>;
};

export async function emitGamificationEvent(payload: GamificationEventPayload) {
  return request<{ duplicate: boolean; stardust_awarded?: number }>("/gamification/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function emitLabCompletionEvents(input: {
  sessionId: string;
  labId: string;
  durationSeconds: number;
  totalAttempts: number;
  hintsUsed: number;
  totalSteps: number;
  labType?: string | null;
  labFamily?: string | null;
  labDelivery?: string | null;
}) {
  const meta = {
    lab_id: input.labId,
    session_id: input.sessionId,
    duration_seconds: input.durationSeconds,
    total_attempts: input.totalAttempts,
    hints_used: input.hintsUsed,
    lab_type: input.labType ?? null,
    lab_family: input.labFamily ?? null,
    lab_delivery: input.labDelivery ?? null,
  };

  await emitGamificationEvent({
    event_id: `lab_completed:${input.sessionId}`,
    event_type: "lab_completed",
    meta,
  });

  if (input.totalAttempts === input.totalSteps && input.hintsUsed === 0) {
    await emitGamificationEvent({
      event_id: `lab_first_try:${input.sessionId}`,
      event_type: "lab_first_try",
      meta,
    });
  }
}
