import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { WORLD_W, WORLD_H } from "./StarpathWorldBackground";

export type StarpathWorldCanvasHandle = {
  reset: () => void;
};

type Props = {
  children: React.ReactNode;
  className?: string;
  /** zoom initial (1 = 100%) */
  initialScale?: number;
  /** clamp zoom */
  minScale?: number;
  maxScale?: number;
};

export default forwardRef<StarpathWorldCanvasHandle, Props>(
  function StarpathWorldCanvas(
    {
      children,
      className,
      initialScale = 1,
      minScale = 0.5,
      maxScale = 3,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [scale, setScale] = useState(initialScale);
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);

    const isPanning = useRef(false);
    const last = useRef({ x: 0, y: 0 });

    const clamp = (v: number, a: number, b: number) =>
      Math.max(a, Math.min(b, v));

    const computeCentered = (s: number) => {
      const el = containerRef.current;
      if (!el) return { tx: 0, ty: 0, scale: s };

      const r = el.getBoundingClientRect();
      const cx = r.width / 2;
      const cy = r.height / 2;

      // center world in viewport
      const nextTx = cx - (WORLD_W * s) / 2;
      const nextTy = cy - (WORLD_H * s) / 2;

      return { tx: nextTx, ty: nextTy, scale: s };
    };

    const resetView = () => {
      const next = computeCentered(initialScale);
      setScale(next.scale);
      setTx(next.tx);
      setTy(next.ty);
    };

    useImperativeHandle(ref, () => ({ reset: resetView }), [initialScale]);

    // initial center
    useLayoutEffect(() => {
      resetView();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // keep correct on resize
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const ro = new ResizeObserver(() => resetView());
      ro.observe(el);
      return () => ro.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // zoom under cursor
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        // world coords under cursor BEFORE zoom
        const worldX = (px - tx) / scale;
        const worldY = (py - ty) / scale;

        const zoomFactor = Math.exp(-e.deltaY * 0.0012);
        const nextScale = clamp(scale * zoomFactor, minScale, maxScale);

        // keep the same world point under cursor AFTER zoom
        const nextTx = px - worldX * nextScale;
        const nextTy = py - worldY * nextScale;

        setScale(nextScale);
        setTx(nextTx);
        setTy(nextTy);
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel as any);
    }, [scale, tx, ty, minScale, maxScale]);

    const onMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      isPanning.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setTx((v) => v + dx);
      setTy((v) => v + dy);
    };

    const stopPan = () => {
      isPanning.current = false;
    };

    return (
      <div
        ref={containerRef}
        className={[
          "relative w-full h-full overflow-hidden select-none",
          "cursor-grab active:cursor-grabbing",
          className ?? "",
        ].join(" ")}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPan}
        onMouseLeave={stopPan}
        style={{ userSelect: "none" }}
      >
        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            transformOrigin: "0 0",
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
            width: WORLD_W,
            height: WORLD_H,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
