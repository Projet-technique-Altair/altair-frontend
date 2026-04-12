export const ALTAIR_TOAST_EVENT = "altair-toast";

export type AltairToastTone = "info" | "success" | "error";

export type AltairToastDetail = {
  message: string;
  tone?: AltairToastTone;
};

export function showGlobalToast(message: string, tone: AltairToastTone = "success") {
  window.dispatchEvent(
    new CustomEvent<AltairToastDetail>(ALTAIR_TOAST_EVENT, {
      detail: { message, tone },
    }),
  );
}
