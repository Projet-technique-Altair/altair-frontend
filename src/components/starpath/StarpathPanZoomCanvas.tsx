// src/components/starpath/StarpathPanZoomCanvas.tsx
//
// NOTE: fichier réutilisé comme "nouveau layer" (contrainte repo: pas de nouveaux fichiers).
// Export default: StarpathLabLayer

import React, { useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import starPng from "@/assets/star.png";
import {
  buildStarpathLabLayout,
  type LabType,
  type PlacedLab,
  type StarpathLabInput,
} from "./starpathLabLayout";
import { WORLD_H, WORLD_W } from "./starpathWorld";

type Props = {
  seed: string;
  labs: StarpathLabInput[];
  completedCount?: number;
};

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
    const placed = buildStarpathLabLayout(seed, labs, completedCount);

    const chapters = [
      { idx: 1 as const, name: "Foundations", rgb: "56,189,248" },
      { idx: 2 as const, name: "Web & Systems", rgb: "122,44,243" },
      { idx: 3 as const, name: "Operations", rgb: "236,72,153" },
    ];

    const labels = chapters.map((ch) => {
      const list = placed.filter((l) => l.chapterIndex === ch.idx);
      const ax = list.reduce((s, l) => s + l.x, 0) / Math.max(1, list.length);
      const ay = list.reduce((s, l) => s + l.y, 0) / Math.max(1, list.length);
      return { ...ch, x: ax, y: ay - 300 };
    });

    return { placed, chapterLabels: labels };
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
            className="rounded-full border border-white/12 bg-black/35 backdrop-blur-md px-5 py-3"
            style={{ boxShadow: `0 0 44px rgba(${ch.rgb}, 0.16)` }}
          >
            <div className="text-[11px] tracking-[0.35em] text-white/50">
              CHAPTER {roman(ch.idx)}
            </div>
            <div
              className="mt-1.5 text-base font-semibold"
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
