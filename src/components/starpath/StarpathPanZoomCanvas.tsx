// src/components/starpath/StarpathPanZoomCanvas.tsx
//
// NOTE: fichier réutilisé comme "nouveau layer" (contrainte repo: pas de nouveaux fichiers).
// Export default: StarpathLabLayer

import React, { useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import starPng from "@/assets/star.png";
import { WORLD_H, WORLD_W } from "./StarpathWorldBackground";

type LabType = "course" | "guided" | "challenge" | "unguided";

type Props = {
  seed: string;
  labs: { lab_id: string; position: number; name?: string }[];
  completedCount?: number;
};

type MockLab = {
  lab_id: string; // 🔥 AJOUT
  order: number;
  chapterIndex: 1 | 2 | 3;
  chapterName: string;
  chapterRgb: string;
  title: string;
  type: LabType;
  description: string;
};

type PlacedLab = MockLab & {
  x: number;
  y: number;
  size: number;
  status: "completed" | "current" | "locked";
};

function hashStringToUint32(str: string) {
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

function roman(n: number) {
  return n === 1 ? "I" : n === 2 ? "II" : "III";
}

function typeLabel(t: LabType) {
  switch (t) {
    case "course":
      return "Course";
    case "guided":
      return "Guided";
    case "challenge":
      return "Challenge";
    case "unguided":
      return "Unguided";
  }
}

function maskStarStyle(color: string) {
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

/*function buildMockLabs(): MockLab[] {
  const chapters = [
    {
      idx: 1 as const,
      name: "Foundations",
      rgb: "56,189,248",
      labs: [
        {
          title: "Course — Orion Basics",
          type: "course" as const,
          description: "Concepts clés, objectifs du chapitre, vocabulaire et workflow.",
        },
        {
          title: "Guided — Linux Navigation",
          type: "guided" as const,
          description: "Commandes essentielles, arborescence, fichiers, permissions (warmup).",
        },
        {
          title: "Challenge — Shell Patterns",
          type: "challenge" as const,
          description: "Objectifs à atteindre (indices limités), pipes, parsing, itérations.",
        },
      ],
    },
    {
      idx: 2 as const,
      name: "Web & Systems",
      rgb: "122,44,243",
      labs: [
        {
          title: "Course — Web Fundamentals",
          type: "course" as const,
          description: "HTTP, cookies, sessions, auth, threat model, bonnes pratiques.",
        },
        {
          title: "Guided — Requests & Auth",
          type: "guided" as const,
          description: "Requêtes, headers, auth, erreurs fréquentes et debug.",
        },
      ],
    },
    {
      idx: 3 as const,
      name: "Operations",
      rgb: "236,72,153",
      labs: [
        {
          title: "Course — Exploitation Primer",
          type: "course" as const,
          description: "Primitives, méthodo, scope, règles de sécurité, approche structurée.",
        },
        {
          title: "Guided — SQLi Warmup",
          type: "guided" as const,
          description: "Reconnaître une injection, payloads basiques, lecture d’indices.",
        },
        {
          title: "Challenge — PrivEsc Path",
          type: "challenge" as const,
          description: "Trouver un chemin de privilèges (résolution libre).",
        },
        {
          title: "Unguided — Orion Gauntlet",
          type: "unguided" as const,
          description: "Lab final sans guide : combine les acquis, full autonomie.",
        },
      ],
    },
  ];

  const out: MockLab[] = [];
  let order = 1;

  for (const ch of chapters) {
    for (const l of ch.labs) {
      out.push({
        order,
        chapterIndex: ch.idx,
        chapterName: ch.name,
        chapterRgb: ch.rgb,
        title: l.title,
        type: l.type,
        description: l.description,
      });
      order++;
    }
  }

  return out;
}*/

export default function StarpathLabLayer({ seed, labs, completedCount = 5 }: Props) {
  const navigate = useNavigate();
  const { placed, chapterLabels } = useMemo(() => {
    const rng = mulberry32(hashStringToUint32(seed + "|labs-layer"));
    const labsMapped: MockLab[] = (labs ?? [])
      .sort((a, b) => a.position - b.position)
      .map((lab, i) => {
        const order = i + 1;
        const chapterIndex = Math.ceil(order / 3) as 1 | 2 | 3;

        const chapterMeta = {
          1: { name: "Foundations", rgb: "56,189,248" },
          2: { name: "Web & Systems", rgb: "122,44,243" },
          3: { name: "Operations", rgb: "236,72,153" },
        }[chapterIndex];

        return {
          lab_id: lab.lab_id, // 🔥 AJOUT
          order,
          chapterIndex,
          chapterName: chapterMeta.name,
          chapterRgb: chapterMeta.rgb,
          title: lab.name ?? lab.lab_id,
          type: "guided",
          description: "",
        };
      });

    const baseCenters = [
      { x: WORLD_W * 0.40, y: WORLD_H * 0.58 },
      { x: WORLD_W * 0.53, y: WORLD_H * 0.44 },
      { x: WORLD_W * 0.66, y: WORLD_H * 0.60 },
    ].map((c) => ({
      x: c.x + randBetween(rng, -110, 110),
      y: c.y + randBetween(rng, -110, 110),
    }));

    const baseAngles = [-18, 18, 52].map(
      (a) => (a + randBetween(rng, -12, 12)) * (Math.PI / 180)
    );

    const placedAll: PlacedLab[] = [];

    const overlaps = (x: number, y: number, r: number) => {
      for (const p of placedAll) {
        const pr = p.size * 0.55;
        const dx = x - p.x;
        const dy = y - p.y;
        const min = r + pr + 46;
        if (dx * dx + dy * dy < min * min) return true;
      }
      return false;
    };

    const placeChapter = (chapterIndex: 1 | 2 | 3) => {
      const center = baseCenters[chapterIndex - 1];
      const angle = baseAngles[chapterIndex - 1];

      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      const perp = { x: -dir.y, y: dir.x };

      const list = labsMapped.filter((l) => l.chapterIndex === chapterIndex);
      const spacing = 310;

      for (let i = 0; i < list.length; i++) {
        const lab = list[i];
        const t = i - (list.length - 1) / 2;

        const size =
          lab.type === "course"
            ? Math.round(270 + randBetween(rng, -12, 12))
            : lab.type === "unguided"
            ? Math.round(285 + randBetween(rng, -10, 10))
            : Math.round(250 + randBetween(rng, -12, 12));

        const status: PlacedLab["status"] =
          lab.order <= completedCount
            ? "completed"
            : lab.order === completedCount + 1
            ? "current"
            : "locked";

        let px = 0;
        let py = 0;
        let ok = false;

        for (let tries = 0; tries < 80; tries++) {
          const jitterAlong = randBetween(rng, -22, 22);
          const jitterPerp = randBetween(rng, -130, 130);
          const jitterFineX = randBetween(rng, -24, 24);
          const jitterFineY = randBetween(rng, -24, 24);

          px =
            center.x +
            dir.x * (t * spacing + jitterAlong) +
            perp.x * jitterPerp +
            jitterFineX;
          py =
            center.y +
            dir.y * (t * spacing + jitterAlong) +
            perp.y * jitterPerp +
            jitterFineY;

          px = clamp(px, 260, WORLD_W - 260);
          py = clamp(py, 260, WORLD_H - 260);

          const r = size * 0.55;
          if (!overlaps(px, py, r)) {
            ok = true;
            break;
          }
        }

        if (!ok) {
          px = clamp(center.x + t * spacing, 260, WORLD_W - 260);
          py = clamp(center.y, 260, WORLD_H - 260);
        }

        placedAll.push({
          ...lab,
          x: Math.round(px * 2) / 2,
          y: Math.round(py * 2) / 2,
          size,
          status,
        });
      }
    };

    placeChapter(1);
    placeChapter(2);
    placeChapter(3);

    placedAll.sort((a, b) => a.order - b.order);

    const chapters = [
      { idx: 1 as const, name: "Foundations", rgb: "56,189,248" },
      { idx: 2 as const, name: "Web & Systems", rgb: "122,44,243" },
      { idx: 3 as const, name: "Operations", rgb: "236,72,153" },
    ];

    const labels = chapters.map((ch) => {
      const list = placedAll.filter((l) => l.chapterIndex === ch.idx);
      const ax = list.reduce((s, l) => s + l.x, 0) / Math.max(1, list.length);
      const ay = list.reduce((s, l) => s + l.y, 0) / Math.max(1, list.length);
      return { ...ch, x: ax, y: ay - 300 };
    });

    return { placed: placedAll, chapterLabels: labels };
  }, [seed, completedCount, labs]);

  return (
    <div className="absolute left-0 top-0" style={{ width: WORLD_W, height: WORLD_H }}>
      <style>{`
        @keyframes spPulse {
          0% { transform: translate(-50%,-50%) scale(1); opacity: .55; }
          60% { transform: translate(-50%,-50%) scale(1.18); opacity: .18; }
          100% { transform: translate(-50%,-50%) scale(1.28); opacity: 0; }
        }
      `}</style>

      <svg className="absolute left-0 top-0 pointer-events-none" width={WORLD_W} height={WORLD_H}>
        {placed.slice(0, -1).map((a, i) => {
          const b = placed[i + 1];
          const completed = b.status === "completed";
          const active = b.status === "current";

          const stroke = completed
            ? "rgba(255,255,255,0.38)"
            : active
            ? "rgba(255,255,255,0.24)"
            : "rgba(255,255,255,0.10)";

          return (
            <line
              key={`${a.order}-${b.order}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeWidth={completed ? 3 : 2}
              strokeLinecap="round"
              strokeDasharray={active ? "7 8" : "0"}
            />
          );
        })}
      </svg>

      {chapterLabels.map((ch) => (
        <div
          key={ch.idx}
          className="absolute pointer-events-none"
          style={{ left: ch.x, top: ch.y, transform: "translate(-50%,-50%)" }}
        >
          <div
            className="rounded-full border border-white/12 bg-black/35 backdrop-blur-md px-4 py-2"
            style={{ boxShadow: `0 0 44px rgba(${ch.rgb}, 0.16)` }}
          >
            <div className="text-[10px] tracking-[0.35em] text-white/50">
              CHAPTER {roman(ch.idx)}
            </div>
            <div
              className="mt-1 text-sm font-semibold"
              style={{
                background: `linear-gradient(90deg, rgba(${ch.rgb},1) 0%, rgba(255,255,255,0.85) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {ch.name}
            </div>
          </div>
        </div>
      ))}

      {placed.map((lab) => {
        const rgb = lab.chapterRgb;
        const completed = lab.status === "completed";
        const current = lab.status === "current";
        const locked = lab.status === "locked";

        const alpha = locked ? 0.16 : completed ? 0.92 : 0.88;

        const glow =
          locked
            ? "none"
            : `drop-shadow(0 0 ${Math.round(lab.size * 0.22)}px rgba(${rgb}, ${
                current ? 0.55 : 0.40
              }))`;

        return (
          <div
            key={lab.order}
            className="absolute group cursor-pointer"
            onClick={() => {
              if (!locked) {
                navigate(`/learner/labs/${lab.lab_id}`);
              }
            }}
            style={{
              left: lab.x,
              top: lab.y,
              width: lab.size,
              height: lab.size,
              transform: "translate(-50%,-50%)",
              pointerEvents: locked ? "none" : "auto",
            }}
            title={locked ? "Locked" : lab.title}
          >
            {current && (
              <div
                className="absolute left-1/2 top-1/2 rounded-full border border-white/25"
                style={{
                  width: lab.size * 1.06,
                  height: lab.size * 1.06,
                  animation: "spPulse 1.8s ease-out infinite",
                }}
              />
            )}

            <div
              className="absolute inset-0"
              style={{
                ...maskStarStyle(`rgba(${rgb}, ${alpha})`),
                mixBlendMode: "screen",
                filter: glow,
              }}
            />

            {!locked && (
              <div
                className="absolute inset-[18%]"
                style={{
                  ...maskStarStyle(`rgba(255,255,255, ${current ? 0.18 : 0.12})`),
                  mixBlendMode: "screen",
                }}
              />
            )}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-center">
              <div className="text-[11px] tracking-[0.28em] text-white/70">
                LAB {lab.order}
              </div>
              <div className="mt-2 inline-flex items-center gap-2">
                <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[11px] text-white/85 backdrop-blur">
                  {typeLabel(lab.type)}
                </span>
                {completed && <Check className="h-4 w-4 text-white/75" />}
                {locked && <Lock className="h-4 w-4 text-white/55" />}
              </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 top-[112%] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
              <div className="w-[360px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                <div className="text-[10px] tracking-[0.35em] text-white/45">
                  CHAPTER {roman(lab.chapterIndex)} • {typeLabel(lab.type).toUpperCase()}
                </div>
                <div className="mt-2 text-sm font-semibold text-white/90">
                  {lab.title}
                </div>
                <div className="mt-2 text-sm text-white/65 leading-relaxed">
                  {lab.description}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `rgba(${rgb}, 1)` }}
                  />
                  <span className="text-[11px] text-white/55">
                    {lab.status === "completed"
                      ? "Completed"
                      : lab.status === "current"
                      ? "Current"
                      : "Locked"}
                  </span>
                  <span className="text-[11px] text-white/35">•</span>
                  <span className="text-[11px] text-white/55">
                    {lab.chapterName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
