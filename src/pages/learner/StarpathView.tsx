import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { RotateCcw, ChevronLeft } from "lucide-react";

import StarpathWorldCanvas, {
  type StarpathWorldCanvasHandle,
} from "@/components/starpath/StarpathWorldCanvas";
import StarpathWorldBackground from "@/components/starpath/StarpathWorldBackground";
import StarpathStarLayer from "@/components/starpath/StarpathStarLayer";

// ✅ ton nouveau layer (default export)
import StarpathLabLayer from "@/components/starpath/StarpathPanZoomCanvas";

function useMockEnabled() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get("mock") === "1", [search]);
}

function prettyFromId(id?: string) {
  if (!id) return "Unknown Starpath";
  if (id === "sp-orion-foundations") return "Orion Foundations";
  return id
    .replace(/^sp-/, "")
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function StarpathView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mock = useMockEnabled();

  const canvasRef = useRef<StarpathWorldCanvasHandle | null>(null);
  const title = useMemo(() => prettyFromId(id), [id]);

  // ✅ Mesure dynamique de la navbar (header)
  const [headerH, setHeaderH] = useState(118);

  useLayoutEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    const update = () => {
      const rect = header.getBoundingClientRect();
      setHeaderH(Math.round(rect.height));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const TOP_OFFSET = headerH;
  const HUD_TOP = TOP_OFFSET + 26;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      {/* ZONE PAN/ZOOM */}
      <div className="absolute left-0 right-0 bottom-0" style={{ top: TOP_OFFSET }}>
        <StarpathWorldCanvas
          ref={canvasRef}
          className="absolute inset-0"
          initialScale={1}
          minScale={0.55}
          maxScale={3}
        >
          <StarpathWorldBackground />

          {/* déco */}
          <StarpathStarLayer seed={id ?? "unknown"} density={3} />

          {/* ✅ labs mock */}
          {mock && <StarpathLabLayer seed={id ?? "unknown"} completedCount={5} />}
        </StarpathWorldCanvas>
      </div>

      {/* HUD */}
      <div className="absolute left-0 right-0" style={{ top: HUD_TOP }}>
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="pointer-events-none flex items-start justify-between gap-6">
            <div className="select-none">
              <div className="text-[10px] tracking-[0.35em] text-white/40">
                STARPATH
              </div>

              <div
                className="mt-2 text-4xl sm:text-5xl font-semibold leading-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(42,167,255,0.85) 0%, rgba(122,44,243,0.85) 55%, rgba(60,120,255,0.85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {title}
              </div>

              {mock && (
                <div className="mt-2 text-sm text-white/35 select-none">
                  mock mode enabled
                </div>
              )}
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={() => navigate("/learner/dashboard")}
                className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white/80 transition flex items-center gap-2"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
                Dashboard
              </button>

              <button
                onClick={() => canvasRef.current?.reset()}
                className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm text-white/80 transition flex items-center gap-2"
                type="button"
                title="Reset view (position + zoom)"
              >
                <RotateCcw className="h-4 w-4" />
                Recenter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-6 bottom-5 text-[11px] text-white/35">
        Drag to pan • Scroll to zoom (under cursor)
      </div>
    </div>
  );
}
