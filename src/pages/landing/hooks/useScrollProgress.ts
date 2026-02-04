import { useEffect, useState } from "react";

export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Plage plus “réactive” (pas trop lente)
      const start = vh * 0.75; // quand le top arrive
      const end = vh * 0.25;   // quand on a bien avancé

      const raw = (start - rect.top) / (start - end);
      const clamped = Math.max(0, Math.min(1, raw));

      // Easing léger : + satisfaisant
      const eased = Math.pow(clamped, 1.2);

      setProgress(eased);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return progress;
}
