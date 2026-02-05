import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crosshair } from "lucide-react";

import StarpathWorldBackground, { WORLD_H, WORLD_W } from "./StarpathWorldBackground";
import StarpathStar from "./StarpathStarLayer";
import StarpathTitle from "./StarpathTitle";

type Props = {
  title: string;
  subtitle?: string;
  mock?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function StarpathPanZoomCanvas({ title, subtitle, mock }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [headerH, setHeaderH] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startOffX: number;
    startOffY: number;
  } | null>(null);

  // Mesure navbar pour démarrer sous la navbar
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

  // Désactiver scroll navigateur
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const recenter = () => {
    const vp = viewportRef.current;
    if (!vp) return;

    const rect = vp.getBoundingClientRect();
    const nextScale = 1;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const nextX = cx - (WORLD_W / 2) * nextScale;
    const nextY = cy - (WORLD_H / 2) * nextScale;

    setScale(nextScale);
    setOffset({ x: nextX, y: nextY });
  };

  useEffect(() => {
    if (!viewportRef.current) return;
    recenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerH]);

  const onPointerDown = (e: React.PointerEvent) => {
    const vp = viewportRef.current;
    if (!vp) return;

    e.preventDefault();
    vp.setPointerCapture(e.pointerId);

    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffX: offset.x,
      startOffY: offset.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d?.dragging) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    setOffset({ x: d.startOffX + dx, y: d.startOffY + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const vp = viewportRef.current;
    if (!vp) return;

    dragRef.current = null;
    try {
      vp.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Zoom sous le curseur
  const onWheel = (e: React.WheelEvent) => {
    const vp = viewportRef.current;
    if (!vp) return;

    e.preventDefault();

    const rect = vp.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const zoomIntensity = 0.0016;
    const nextScale = clamp(scale * Math.exp(-e.deltaY * zoomIntensity), 0.55, 3.2);

    const wx = (cx - offset.x) / scale;
    const wy = (cy - offset.y) / scale;

    const nextX = cx - wx * nextScale;
    const nextY = cy - wy * nextScale;

    setScale(nextScale);
    setOffset({ x: nextX, y: nextY });
  };

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-0 bg-black"
      style={{
        top: headerH,
        height: `calc(100vh - ${headerH}px)`,
      }}
    >
      <div
        ref={viewportRef}
        className="absolute inset-0 overflow-hidden select-none"
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {/* WORLD (moveable) */}
        <div
          className="absolute left-0 top-0"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <StarpathWorldBackground />

          {/* ✅ Une seule étoile blanche par défaut */}
          <StarpathStar x={WORLD_W / 2 - 90} y={WORLD_H / 2 - 90} size={180} />
        </div>

        {/* OVERLAY (static) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Title lowered to avoid navbar overlap */}
          <div className="absolute left-8 top-10">
            <StarpathTitle title={title} subtitle={subtitle} mock={mock} />
          </div>

          {/* Recenter */}
          <div className="pointer-events-auto absolute left-8 bottom-8">
            <button
              type="button"
              onClick={recenter}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10 transition"
              aria-label="Recenter"
              title="Recenter"
            >
              <Crosshair className="h-4 w-4" />
              Recenter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
