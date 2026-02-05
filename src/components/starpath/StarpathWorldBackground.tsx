// src/components/starpath/StarpathWorldBackground.tsx
import React, { useMemo } from "react";

export const WORLD_W = 3600;
export const WORLD_H = 2400;

type Props = {
  /** seed stable (id du starpath recommandé) */
  seed?: string | number;
};

function hashStringToUint32(str: string) {
  // FNV-1a 32-bit
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function randBetween(rng: () => number, a: number, b: number) {
  return a + (b - a) * rng();
}

export default function StarpathWorldBackground({ seed = "default" }: Props) {
  const backgroundImage = useMemo(() => {
    const s =
      typeof seed === "number" ? (seed >>> 0) : hashStringToUint32(String(seed));
    const rng = mulberry32(s);

    // Palette (tu peux ajuster)
    const C = {
      sky: "56,189,248",
      indigo: "99,102,241",
      violet: "122,44,243",
      pink: "236,72,153",
      ember: "245,158,11",
    };
    const palette = [C.sky, C.indigo, C.violet, C.pink];

    // ----- Edge fade fixe (anti “rectangle net”)
    const edge = [
      "linear-gradient(180deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0) 18%)",
      "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 22%)",
      "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 18%)",
      "linear-gradient(270deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 18%)",
      "radial-gradient(ellipse 1500px 1000px at 0% 60%, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0) 74%)",
      "radial-gradient(ellipse 1500px 1000px at 100% 40%, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0) 74%)",
      "radial-gradient(ellipse 1200px 900px at 10% 95%, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0) 76%)",
      "radial-gradient(ellipse 1200px 900px at 90% 5%, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0) 76%)",
    ];

    // ----- Color wash (angle + intensité variables)
    const angle = Math.floor(randBetween(rng, 90, 160));
    const a1 = randBetween(rng, 0.10, 0.18);
    const a2 = randBetween(rng, 0.12, 0.20);
    const a3 = randBetween(rng, 0.06, 0.14);
    const wash = `linear-gradient(${angle}deg, rgba(${C.sky},${a1}) 0%, rgba(${C.violet},${a2}) 45%, rgba(${C.pink},${a3}) 75%, rgba(0,0,0,0) 100%)`;

    // ----- Mega blobs (forme de l’amas = positions/tailles random)
    const mega: string[] = [];
    const megaCount = Math.floor(randBetween(rng, 6, 10)); // 6–9
    for (let i = 0; i < megaCount; i++) {
      const px = Math.floor(randBetween(rng, 6, 94));
      const py = Math.floor(randBetween(rng, 10, 92));
      const w = Math.floor(randBetween(rng, 2000, 3000));
      const h = Math.floor(randBetween(rng, 1500, 2400));
      const col = pick(rng, palette);
      const alpha = clamp(randBetween(rng, 0.26, 0.55), 0.22, 0.60);
      const cut = Math.floor(randBetween(rng, 68, 78)); // fade-out %
      mega.push(
        `radial-gradient(ellipse ${w}px ${h}px at ${px}% ${py}%, rgba(${col},${alpha}) 0%, rgba(0,0,0,0) ${cut}%)`
      );
    }

    // ----- Center boost (pas obligatoire, mais aide)
    const centerBoost = [
      `radial-gradient(ellipse 2200px 1500px at ${Math.floor(
        randBetween(rng, 45, 55)
      )}% ${Math.floor(randBetween(rng, 45, 60))}%, rgba(${C.violet},${randBetween(
        rng,
        0.18,
        0.32
      )}) 0%, rgba(0,0,0,0) 76%)`,
      `radial-gradient(ellipse 2000px 1400px at ${Math.floor(
        randBetween(rng, 45, 55)
      )}% ${Math.floor(randBetween(rng, 40, 58))}%, rgba(${C.sky},${randBetween(
        rng,
        0.12,
        0.26
      )}) 0%, rgba(0,0,0,0) 78%)`,
    ];

    // ----- Quelques clouds plus petits
    const clouds: string[] = [];
    const cloudCount = Math.floor(randBetween(rng, 4, 7));
    for (let i = 0; i < cloudCount; i++) {
      const px = Math.floor(randBetween(rng, 12, 88));
      const py = Math.floor(randBetween(rng, 15, 90));
      const w = Math.floor(randBetween(rng, 900, 1600));
      const h = Math.floor(randBetween(rng, 700, 1200));
      const col = pick(rng, palette);
      const alpha = clamp(randBetween(rng, 0.10, 0.22), 0.08, 0.26);
      const cut = Math.floor(randBetween(rng, 70, 82));
      clouds.push(
        `radial-gradient(ellipse ${w}px ${h}px at ${px}% ${py}%, rgba(${col},${alpha}) 0%, rgba(0,0,0,0) ${cut}%)`
      );
    }

    // ----- Vignette légère (top)
    const vignette =
      "radial-gradient(ellipse 2200px 1500px at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 72%, rgba(0,0,0,0.18) 100%)";

    // ----- Base wash (bottom, opaque)
    const baseWash =
      "linear-gradient(180deg, #000000 0%, #050418 45%, #000000 100%)";

    // Ordre: TOP -> BOTTOM
    return [
      ...edge,
      vignette,
      wash,
      ...mega,
      ...centerBoost,
      ...clouds,
      baseWash,
    ].join(", ");
  }, [seed]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WORLD_W,
        height: WORLD_H,
        backgroundColor: "#000000",
        backgroundRepeat: "no-repeat",
        backgroundImage,
        filter: "saturate(1.18) contrast(1.05)",
      }}
    />
  );
}
