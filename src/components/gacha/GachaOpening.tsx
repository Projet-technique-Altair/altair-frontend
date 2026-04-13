import { useEffect, useRef, useState } from "react";
import ConstellationArtwork from "@/components/gamification/ConstellationArtwork";
import GachaCurtain from "@/components/gacha/GachaCurtain";
import { GACHA_LAST_FRAME } from "@/components/gacha/gachaScene";
import type { GachaOpenResponse } from "@/contracts/gacha";

const RARITY_GLOW: Record<string, string> = {
  common: "#94A3B8",
  rare: "#60A5FA",
  epic: "#C084FC",
  legendary: "#F6C453",
};

type Props = {
  result: GachaOpenResponse | null;
  onReveal: () => void;
};

export default function GachaOpening({ result, onReveal }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rapidSkipClicksRef = useRef<number[]>([]);
  const skipHintTimeoutRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "awaiting-result" | "blur" | "revealing">("playing");
  const [showSkipHint, setShowSkipHint] = useState(false);

  useEffect(() => {
    setPhase("playing");
    setShowSkipHint(false);
    rapidSkipClicksRef.current = [];

    return () => {
      if (skipHintTimeoutRef.current) {
        window.clearTimeout(skipHintTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (result && phase === "awaiting-result") {
      setPhase("blur");
    }
  }, [phase, result]);

  const moveToBlurPhase = () => {
    setPhase(result ? "blur" : "awaiting-result");
  };

  const handleSkip = () => {
    if (phase !== "playing") {
      return;
    }

    setShowSkipHint(false);

    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      moveToBlurPhase();
      return;
    }

    let finalized = false;
    const finalizeSkip = () => {
      if (finalized) {
        return;
      }
      finalized = true;
      video.pause();
      moveToBlurPhase();
    };

    video.addEventListener("seeked", finalizeSkip, { once: true });
    window.setTimeout(finalizeSkip, 140);
    video.currentTime = Math.max(video.duration - 0.08, 0);
  };

  const handleFocusConstellation = () => {
    if (!result || phase !== "blur") {
      return;
    }

    setPhase("revealing");
    window.setTimeout(() => onReveal(), 780);
  };

  const handleRapidSkip = () => {
    if (phase !== "playing") {
      return;
    }

    const now = window.performance.now();
    const recentClicks = rapidSkipClicksRef.current.filter((stamp) => now - stamp < 900);
    recentClicks.push(now);
    rapidSkipClicksRef.current = recentClicks;

    if (recentClicks.length >= 2) {
      setShowSkipHint(true);

      if (skipHintTimeoutRef.current) {
        window.clearTimeout(skipHintTimeoutRef.current);
      }

      skipHintTimeoutRef.current = window.setTimeout(() => {
        setShowSkipHint(false);
      }, 1200);
    }

    if (recentClicks.length >= 4) {
      rapidSkipClicksRef.current = [];
      handleSkip();
    }
  };

  const rarity = result?.roll.rarity ?? "common";
  const glow = RARITY_GLOW[rarity] ?? RARITY_GLOW.common;
  const waitingForResult = phase === "awaiting-result" && !result;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden bg-black text-white"
      onPointerDown={handleRapidSkip}
    >
      <style>
        {`
          @keyframes openingAtmosphere {
            0% {
              opacity: 1;
              transform: scale(1);
              filter: blur(0px);
            }
            100% {
              opacity: 0;
              transform: scale(1.04);
              filter: blur(10px);
            }
          }

          @keyframes constellationPulse {
            0%, 100% {
              transform: scale(0.98);
              opacity: 0.55;
            }
            50% {
              transform: scale(1.03);
              opacity: 0.95;
            }
          }
        `}
      </style>
      <GachaCurtain mode="fade-out" durationMs={760} />
      <div className="pointer-events-none absolute inset-0 bg-black" />
      <video
        ref={videoRef}
        className={[
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
          phase === "playing" ? "opacity-100" : "opacity-0",
        ].join(" ")}
        src="/animations/gacha-telescope.mp4"
        autoPlay
        muted
        playsInline
        onEnded={moveToBlurPhase}
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-out",
          phase === "playing" ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <img
          src={GACHA_LAST_FRAME}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className={[
          "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out",
          phase === "playing"
            ? "opacity-100 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.28)_54%,rgba(0,0,0,0.72)_100%)]"
            : "opacity-100 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.26)_48%,rgba(0,0,0,0.74)_100%)]",
        ].join(" ")}
      />

      {phase === "playing" ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0)_38%),linear-gradient(180deg,rgba(8,10,18,0.02)_0%,rgba(8,10,18,0.16)_100%)] opacity-100 animate-[openingAtmosphere_0.7s_ease-out_forwards]" />
          <div
            className={[
              "pointer-events-none absolute right-6 top-6 z-20 transition-all duration-300 ease-out",
              showSkipHint ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
            ].join(" ")}
          >
            <p className="text-sm font-medium tracking-[0.24em] uppercase text-white/88 drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]">
              Skip
            </p>
          </div>
        </>
      ) : (
        <div className="relative flex h-full w-full items-center justify-center">
          {waitingForResult ? (
            <div className="relative z-10 flex max-w-xl flex-col items-center gap-5 rounded-[32px] border border-white/10 bg-black/45 px-10 py-8 text-center shadow-[0_0_80px_rgba(59,130,246,0.12)] backdrop-blur-xl">
              <div className="h-16 w-16 rounded-full border border-sky-400/35 border-t-sky-300 animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-200/90">
                  Synchronizing signal
                </p>
                <p className="text-base text-white/80">
                  The capsule has opened. We are resolving your constellation and preparing the reveal.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="relative flex aspect-square h-[56vh] w-[56vh] max-h-[620px] max-w-[620px] items-center justify-center transition-all duration-700 ease-out">
              <div
                className={[
                  "pointer-events-none absolute -top-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-[34px] transition-all duration-[1350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  phase === "blur" ? "opacity-100 scale-100" : "opacity-0 scale-[1.85]",
                ].join(" ")}
                style={{ background: `${glow}88` }}
              />
              <div
                className={[
                  "pointer-events-none absolute inset-[13%] rounded-full transition-all duration-[1350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  phase === "blur" ? "opacity-100 blur-[120px] scale-100" : "opacity-90 blur-[72px] scale-[1.42]",
                ].join(" ")}
                style={{ background: `${glow}72` }}
              />
              <div
                className={[
                  "pointer-events-none absolute inset-[4%] rounded-full transition-all duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  phase === "revealing"
                    ? "opacity-100 blur-[84px] scale-[1.24]"
                    : "opacity-0 blur-[48px] scale-100",
                ].join(" ")}
                style={{ background: `${glow}a8` }}
              />
              <div
                className="pointer-events-none absolute inset-[12%] rounded-full border transition-all duration-[1350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ borderColor: `${glow}55` }}
              />
              <button
                type="button"
                aria-label={`Focus ${result.roll.name}`}
                onClick={handleFocusConstellation}
                disabled={phase !== "blur"}
                className={[
                  "relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_60px_rgba(0,0,0,0.28)] transition-all duration-[1350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  phase === "blur"
                    ? "cursor-pointer scale-100"
                    : "cursor-default scale-[1.22]",
                ].join(" ")}
              >
                <div
                  className={[
                    "pointer-events-none absolute inset-[6%] rounded-full border transition-all duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    phase === "blur"
                      ? "animate-[constellationPulse_2.8s_ease-in-out_infinite] opacity-80"
                      : "opacity-0 scale-[1.22]",
                  ].join(" ")}
                  style={{ borderColor: `${glow}65`, boxShadow: `0 0 40px ${glow}55` }}
                />
                <div
                  className={[
                    "pointer-events-none absolute inset-0 transition-all duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    phase === "revealing" ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  style={{
                    background: `radial-gradient(circle at center, ${glow}44 0%, ${glow}1e 38%, transparent 72%)`,
                  }}
                />
                <ConstellationArtwork
                  imageUrl={result.roll.image_url}
                  alt={result.roll.name}
                  containerClassName="h-full w-full"
                  imageClassName={[
                    "h-full w-full object-contain transition-all duration-[780ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    phase === "blur"
                      ? "scale-[0.34] p-[24%] opacity-58 blur-[34px]"
                      : "scale-[1.08] p-[8%] opacity-100 blur-[3px]",
                  ].join(" ")}
                  fallbackClassName="bg-transparent"
                  fallbackSymbolClassName="text-8xl text-white/25 blur-sm"
                />
              </button>

              <div className="absolute inset-x-0 -bottom-16 flex flex-col items-center gap-3">
                <p
                  className={[
                    "text-center text-sm font-medium tracking-[0.18em] uppercase transition-all duration-500 ease-out",
                    phase === "blur" ? "opacity-100" : "opacity-0 -translate-y-2",
                  ].join(" ")}
                  style={{
                    color: glow,
                    textShadow: `0 0 18px ${glow}, 0 0 40px ${glow}88`,
                  }}
                >
                  Focus the constellation
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                  Tap the signal to bring it into focus
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {phase === "revealing" ? <GachaCurtain mode="fade-in" durationMs={760} /> : null}
    </div>
  );
}
