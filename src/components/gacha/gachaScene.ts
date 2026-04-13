export type GachaSceneMode = "menu" | "opening" | "result";

export const GACHA_SCENE_EVENT = "altair-gacha-scene";
export const GACHA_FIRST_FRAME = "/animations/gacha-first.png";
export const GACHA_LAST_FRAME = "/animations/gacha-last.png";

type GachaSceneDetail = {
  mode: GachaSceneMode;
};

export function publishGachaScene(mode: GachaSceneMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<GachaSceneDetail>(GACHA_SCENE_EVENT, {
      detail: { mode },
    }),
  );
}

export function readGachaScene(event: Event): GachaSceneMode | null {
  const customEvent = event as CustomEvent<GachaSceneDetail>;
  return customEvent.detail?.mode ?? null;
}
