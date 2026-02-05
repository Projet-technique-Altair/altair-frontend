// src/components/starpath/StarpathStarLayer.tsx
import React, { useEffect, useMemo, useRef } from "react";
import starPng from "@/assets/star.png";
import { WORLD_H, WORLD_W } from "./StarpathWorldBackground";

type StarfieldProps = {
  seed?: string | number;
  /** 1 = dense. 2-3 = très dense. */
  density?: number;
  className?: string;
};

type SingleStarProps = {
  x: number;
  y: number;
  size?: number;
  color?: string;
  opacity?: number;
};

type Props = StarfieldProps & Partial<SingleStarProps>;

type Star = {
  x: number;
  y: number;
  size: number; // integer px
  rgb: string; // "r,g,b"
  a: number;
  rot: number; // deg
  glow: number;
  micro: boolean;
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

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function randBetween(rng: () => number, a: number, b: number) {
  return a + (b - a) * rng();
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

function tintMaskStyle(color: string) {
  return {
    backgroundColor: color,
    WebkitMaskImage: `url(${starPng})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    WebkitMaskSize: "contain",
    maskImage: `url(${starPng})`,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "contain",
  } as const;
}

export default function StarpathStarLayer({
  seed = "default",
  density = 1,
  className,
  x,
  y,
  size,
  color,
  opacity,
}: Props) {
  const isSingle = typeof x === "number" && typeof y === "number";

  // =========================
  // SINGLE STAR MODE (compat)
  // =========================
  if (isSingle) {
    const s = size ?? 180;
    const a = opacity ?? 1;
    const c = color ?? `rgba(255,255,255,${a})`;

    return (
      <div
        className={["absolute left-0 top-0 pointer-events-none", className ?? ""].join(" ")}
        style={{ width: WORLD_W, height: WORLD_H }}
      >
        <div
          style={{
            position: "absolute",
            left: x!,
            top: y!,
            width: s,
            height: s,
            transform: "translate(-50%, -50%)",
            opacity: a,
            ...tintMaskStyle(c),
            mixBlendMode: "screen",
            filter: `drop-shadow(0 0 ${Math.round(s * 0.55)}px rgba(255,255,255,0.35))`,
          }}
        />
      </div>
    );
  }

  // =========================
  // STARFIELD MODE (canvas)
  // =========================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stars = useMemo<Star[]>(() => {
    const s =
      typeof seed === "number" ? (seed >>> 0) : hashStringToUint32(String(seed));
    const rng = mulberry32(s);

    const d = clamp(density, 0.4, 4);

    // Palette pondérée (majorité blanc/bleu, amber très rare)
    const paletteWeighted = [
      "255,255,255",
      "255,255,255",
      "255,255,255",
      "255,255,255",
      "56,189,248",
      "56,189,248",
      "99,102,241",
      "99,102,241",
      "122,44,243",
      "236,72,153",
      "245,158,11",
    ];

    // Centre de l'amas (aligné avec ton background)
    const cx = WORLD_W * 0.52;
    const cy = WORLD_H * 0.52;

    // Taille de l'amas (ellipse)
    // -> plus grand = amas plus étalé (si tu veux)
    const RX = WORLD_W * 0.33; // rayon horizontal de l'amas
    const RY = WORLD_H * 0.30; // rayon vertical de l'amas

    // “Falloff” : plus grand = plus concentré au centre
    const FALLOFF = 2.6;

    // Très dense au centre, de moins en moins vers le bord,
    // et hors amas: presque rien.
    const microCount = Math.floor(22000 * d);
    const midCount = Math.floor(7500 * d);
    const bigCount = Math.floor(520 * d);

    // Hors-amas : quasi zéro
    const outsideSparseCount = Math.floor(18 * d);

    const out: Star[] = [];

    // Spatial hash anti-superposition (rapide)
    const cellSize = 22;
    const grid = new Map<number, number[]>();
    const keyOf = (gx: number, gy: number) => (gx << 16) ^ gy;

    const addToGrid = (idx: number, px: number, py: number) => {
      const gx = Math.floor(px / cellSize);
      const gy = Math.floor(py / cellSize);
      const k = keyOf(gx, gy);
      const arr = grid.get(k);
      if (arr) arr.push(idx);
      else grid.set(k, [idx]);
    };

    const overlaps = (px: number, py: number, r: number) => {
      const gx = Math.floor(px / cellSize);
      const gy = Math.floor(py / cellSize);

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const arr = grid.get(keyOf(gx + ox, gy + oy));
          if (!arr) continue;
          for (let i = 0; i < arr.length; i++) {
            const p = out[arr[i]];
            const pr = p.size * 0.5;
            const dx = px - p.x;
            const dy = py - p.y;
            const min = r + pr + 1.2;
            if (dx * dx + dy * dy < min * min) return true;
          }
        }
      }
      return false;
    };

    // ======== Sampling dans l'amas avec densité décroissante ========
    // r in [0..1] (ellipse normalisée). Plus r est proche de 1, plus c'est vide.
    const sampleInCluster = () => {
      // on tire un point uniforme dans le disque, puis on applique un poids
      // -> on accepte avec prob (1-r)^FALLOFF => très dense au centre, quasi vide au bord.
      for (let tries = 0; tries < 30; tries++) {
        const theta = rng() * Math.PI * 2;
        const rArea = Math.sqrt(rng()); // uniforme en surface
        const acceptP = Math.pow(1 - rArea, FALLOFF);

        if (rng() > acceptP) continue;

        const x = cx + Math.cos(theta) * rArea * RX;
        const y = cy + Math.sin(theta) * rArea * RY;

        // clamp world
        if (x < 10 || y < 10 || x > WORLD_W - 10 || y > WORLD_H - 10) continue;

        return { x, y, rArea };
      }
      return null;
    };

    // ======== Sampling hors-amas (rare) ========
    const sampleOutside = () => {
      // On ne prend que des points bien hors ellipse (r > 1.15),
      // et on en met très peu.
      for (let tries = 0; tries < 60; tries++) {
        const x = randBetween(rng, 10, WORLD_W - 10);
        const y = randBetween(rng, 10, WORLD_H - 10);

        const nx = (x - cx) / RX;
        const ny = (y - cy) / RY;
        const r = Math.sqrt(nx * nx + ny * ny);

        if (r < 1.15) continue; // pas dans / proche de l'amas
        if (r > 1.8) continue; // trop loin => on n'en veut quasi jamais

        // proba ultra faible même là
        if (rng() > 0.12) continue;

        return { x, y };
      }
      return null;
    };

    const place = (
      posGen: () => { x: number; y: number; rArea?: number } | null,
      sizeGen: () => number,
      alphaGen: (rArea?: number) => number,
      micro: boolean,
      tries = 26
    ) => {
      for (let t = 0; t < tries; t++) {
        const p = posGen();
        if (!p) continue;

        let px = p.x;
        let py = p.y;

        // snap (évite subpixel artifacts)
        if (micro) {
          px = Math.round(px);
          py = Math.round(py);
        } else {
          px = Math.round(px * 2) / 2;
          py = Math.round(py * 2) / 2;
        }

        // tailles entières + minimum pour garder la forme star.png
        let sz = Math.round(sizeGen());
        if (micro) sz = Math.max(9, sz);
        const r = sz * 0.5;

        if (overlaps(px, py, r)) continue;

        const rgb = pick(rng, paletteWeighted);

        // alpha dépend un peu de la distance au centre (plus faible vers le bord)
        let a = alphaGen(p.rArea);
        if (rgb === "245,158,11") a *= 0.55;

        // rotation uniquement sur grosses (sinon alias)
        const rot = micro || sz < 18 ? 0 : randBetween(rng, -10, 10);

        out.push({
          x: px,
          y: py,
          size: sz,
          rgb,
          a: clamp(a, 0.06, 0.9),
          rot,
          glow: randBetween(rng, 0.25, 1.0),
          micro,
        });
        addToGrid(out.length - 1, px, py);
        return;
      }
    };

    // ===== Big (centre surtout) =====
    for (let i = 0; i < bigCount; i++) {
      place(
        sampleInCluster,
        () => {
          const t = rng();
          if (t < 0.8) return randBetween(rng, 16, 24);
          return randBetween(rng, 24, 32);
        },
        (rArea) => {
          const r = rArea ?? 0;
          // plus brillant au centre
          return randBetween(rng, 0.22, 0.55) * (1 - 0.55 * r);
        },
        false,
        40
      );
    }

    // ===== Mid (amas avec falloff) =====
    for (let i = 0; i < midCount; i++) {
      place(
        sampleInCluster,
        () => {
          const t = rng();
          if (t < 0.84) return randBetween(rng, 10, 14);
          if (t < 0.97) return randBetween(rng, 14, 18);
          return randBetween(rng, 18, 22);
        },
        (rArea) => {
          const r = rArea ?? 0;
          // au bord: beaucoup plus discret
          return randBetween(rng, 0.10, 0.34) * (1 - 0.75 * r);
        },
        false,
        28
      );
    }

    // ===== Micro carpet (très dense au centre, quasi vide au bord) =====
    for (let i = 0; i < microCount; i++) {
      place(
        sampleInCluster,
        () => randBetween(rng, 9, 12),
        (rArea) => {
          const r = rArea ?? 0;
          // micro très présent au centre, s'efface vers le bord
          return randBetween(rng, 0.06, 0.16) * (1 - 0.9 * r);
        },
        true,
        16
      );
    }

    // ===== Hors-amas : presque rien =====
    for (let i = 0; i < outsideSparseCount; i++) {
      place(
        () => sampleOutside(),
        () => randBetween(rng, 10, 16),
        () => randBetween(rng, 0.05, 0.12),
        false,
        40
      );
    }

    return out;
  }, [seed, density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = starPng;

    img.onload = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.floor(WORLD_W * dpr);
      canvas.height = Math.floor(WORLD_H * dpr);
      canvas.style.width = `${WORLD_W}px`;
      canvas.style.height = `${WORLD_H}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, WORLD_W, WORLD_H);

      ctx.imageSmoothingEnabled = true;
      (ctx as any).imageSmoothingQuality = "high";

      ctx.globalCompositeOperation = "screen";

      // Cache sprites pré-scalés (rgb|size)
      const spriteCache = new Map<string, HTMLCanvasElement>();
      const getSprite = (rgb: string, size: number) => {
        const key = `${rgb}|${size}`;
        const cached = spriteCache.get(key);
        if (cached) return cached;

        const off = document.createElement("canvas");
        off.width = size;
        off.height = size;

        const octx = off.getContext("2d")!;
        octx.clearRect(0, 0, size, size);
        octx.imageSmoothingEnabled = true;
        (octx as any).imageSmoothingQuality = "high";

        octx.drawImage(img, 0, 0, size, size);
        octx.globalCompositeOperation = "source-in";
        octx.fillStyle = `rgb(${rgb})`;
        octx.fillRect(0, 0, size, size);

        spriteCache.set(key, off);
        return off;
      };

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const sprite = getSprite(s.rgb, s.size);

        ctx.save();
        ctx.globalAlpha = s.a;
        ctx.filter = "none";

        if (!s.micro) {
          ctx.shadowBlur = Math.max(4, s.size * 0.55);
          ctx.shadowColor = `rgba(${s.rgb}, ${Math.min(0.55, s.a * s.glow)})`;
        } else {
          ctx.shadowBlur = 0;
        }

        if (s.rot) {
          ctx.translate(s.x, s.y);
          ctx.rotate((s.rot * Math.PI) / 180);
          ctx.drawImage(sprite, -s.size / 2, -s.size / 2, s.size, s.size);
        } else {
          ctx.drawImage(sprite, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        }

        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
    };

    return () => {
      img.onload = null;
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={["absolute left-0 top-0 pointer-events-none", className ?? ""].join(" ")}
      style={{ width: WORLD_W, height: WORLD_H }}
    />
  );
}
