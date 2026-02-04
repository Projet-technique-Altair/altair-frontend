import { useEffect, useRef, useState } from "react";

/**
 * Reveal an element when it enters the viewport.
 *
 * @param threshold Intersection ratio before revealing (default: 0.2)
 */
export function useRevealOnScroll(threshold: number = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target); // reveal once
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
