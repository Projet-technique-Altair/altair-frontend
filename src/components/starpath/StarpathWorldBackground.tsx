// src/components/starpath/StarpathWorldBackground.tsx
import React from "react";

export const WORLD_W = 3600;
export const WORLD_H = 2400;

/**
 * Ultra visible nebula background.
 * IMPORTANT:
 * - In CSS, the first background-image is drawn on TOP of the next ones.
 * - So any opaque layer must be LAST (bottom), otherwise it hides everything.
 */
export default function StarpathWorldBackground() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: WORLD_W,
        height: WORLD_H,
        backgroundColor: "#000000",
        backgroundImage: [
          // ===== LIGHT VIGNETTE (TOP, subtle darkening) =====
          "radial-gradient(ellipse 1800px 1200px at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0.32) 100%)",

          // ===== COLOR SWIRL / WASH (semi-transparent, can be on top) =====
          "linear-gradient(120deg, rgba(56,189,248,0.22) 0%, rgba(122,44,243,0.26) 40%, rgba(236,72,153,0.18) 70%, rgba(0,0,0,0) 100%)",

          // ===== MEGA BLOBS =====
          "radial-gradient(ellipse 2600px 1900px at 10% 20%, rgba(122,44,243,0.85) 0%, rgba(0,0,0,0) 70%)",
          "radial-gradient(ellipse 2600px 1900px at 35% 30%, rgba(56,189,248,0.72) 0%, rgba(0,0,0,0) 72%)",
          "radial-gradient(ellipse 2600px 1900px at 70% 25%, rgba(99,102,241,0.78) 0%, rgba(0,0,0,0) 72%)",
          "radial-gradient(ellipse 2600px 2000px at 92% 50%, rgba(122,44,243,0.70) 0%, rgba(0,0,0,0) 74%)",
          "radial-gradient(ellipse 2600px 2000px at 55% 88%, rgba(56,189,248,0.62) 0%, rgba(0,0,0,0) 76%)",
          "radial-gradient(ellipse 2600px 2000px at 15% 88%, rgba(99,102,241,0.62) 0%, rgba(0,0,0,0) 76%)",

          // ===== CENTER SATURATION (avoid dead middle) =====
          "radial-gradient(ellipse 2200px 1600px at 50% 52%, rgba(122,44,243,0.55) 0%, rgba(0,0,0,0) 74%)",
          "radial-gradient(ellipse 2200px 1600px at 52% 48%, rgba(56,189,248,0.42) 0%, rgba(0,0,0,0) 76%)",
          "radial-gradient(ellipse 1800px 1400px at 48% 60%, rgba(236,72,153,0.28) 0%, rgba(0,0,0,0) 80%)",

          // ===== CORNERS (no dead corners) =====
          "radial-gradient(ellipse 2400px 1900px at 0% 0%, rgba(56,189,248,0.55) 0%, rgba(0,0,0,0) 74%)",
          "radial-gradient(ellipse 2400px 1900px at 100% 0%, rgba(122,44,243,0.55) 0%, rgba(0,0,0,0) 76%)",
          "radial-gradient(ellipse 2400px 2000px at 0% 100%, rgba(99,102,241,0.50) 0%, rgba(0,0,0,0) 76%)",
          "radial-gradient(ellipse 2400px 2000px at 100% 100%, rgba(236,72,153,0.40) 0%, rgba(0,0,0,0) 78%)",

          // ===== MID CLOUDS (density) =====
          "radial-gradient(ellipse 1400px 1100px at 22% 45%, rgba(122,44,243,0.52) 0%, rgba(0,0,0,0) 72%)",
          "radial-gradient(ellipse 1400px 1100px at 62% 52%, rgba(99,102,241,0.46) 0%, rgba(0,0,0,0) 72%)",
          "radial-gradient(ellipse 1400px 1100px at 80% 70%, rgba(56,189,248,0.34) 0%, rgba(0,0,0,0) 74%)",
          "radial-gradient(ellipse 1200px 900px at 36% 84%, rgba(245,158,11,0.18) 0%, rgba(0,0,0,0) 80%)",

          // ✅ BASE WASH (OPAQUE) — MUST BE LAST (BOTTOM)
          "linear-gradient(180deg, #000000 0%, #06051a 45%, #000000 100%)",
        ].join(", "),
        backgroundRepeat: "no-repeat",
        filter: "saturate(1.55) contrast(1.10)",
      }}
    />
  );
}
