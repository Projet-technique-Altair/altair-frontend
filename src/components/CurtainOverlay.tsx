/**
 * @file Transition curtain overlay for Altair’s page fade effects.
 *
 * @remarks
 * The `CurtainOverlay` component handles smooth fade-in and fade-out transitions
 * between pages, preventing white flashes and maintaining Altair’s immersive visual flow.
 *
 * It uses two layered animated gradients powered by Framer Motion to create
 * a subtle organic motion effect during navigation or initial page load.
 *
 * The animation trigger is based on the `sessionStorage` flag `"altairTransition"`,
 * which ensures transitions occur only when explicitly initiated by the app.
 *
 * @packageDocumentation
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


/**
 * Props for the {@link CurtainOverlay} component.
 *
 * @property delayMs - Delay (in milliseconds) before the fade-out begins. Defaults to `250`.
 * @property fadeMs - Duration (in milliseconds) of the fade animation. Defaults to `950`.
 *
 * @public
 */
type Props = {
  delayMs?: number; // attente avant de lancer le fade
  fadeMs?: number;  // durée du fade
};


/**
 * Handles the fade transition overlay displayed between Altair page navigations.
 *
 * @remarks
 * Features:
 * - Two animated layers (dark base + colored accent)
 * - Non-blocking overlay (pointer-events disabled)
 * - Self-cleaning transition control via `sessionStorage`
 * - Automatic failsafe timeout to guarantee removal
 *
 * This component runs autonomously at app level and should not be rendered multiple times concurrently.
 *
 * @param props - {@link Props} defining animation delay and fade duration.
 * @returns A React JSX element rendering the animated overlay during page transitions.
 *
 * @public
 */
export default function CurtainOverlay({ delayMs = 250, fadeMs = 950 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stamp = sessionStorage.getItem("altairTransition");
    if (!stamp) {
      // Pas de transition à jouer
      return;
    }

    console.log("[Curtain] Show with stamp:", stamp);

    // 1) Show immédiat
    setVisible(true);

    // 2) Lancer le fade après un court délai
    const start = window.setTimeout(() => {
      console.log("[Curtain] Start fade-out");
      setVisible(false);
      // 3) Nettoyer le flag pour éviter de rejouer au refresh
      sessionStorage.removeItem("altairTransition");
    }, delayMs);

    // 4) Failsafe: quoi qu'il arrive, force hide après delay+fade+200ms
    const hardStop = window.setTimeout(() => {
      console.warn("[Curtain] Failsafe hide");
      setVisible(false);
      sessionStorage.removeItem("altairTransition");
    }, delayMs + fadeMs + 200);

    return () => { window.clearTimeout(start); window.clearTimeout(hardStop); };
  }, [delayMs, fadeMs]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Base sombre: garantit aucun flash blanc & ne bloque pas les clics */}
          <motion.div
            key="curtain-base"
            className="fixed inset-0 z-[9998] pointer-events-none bg-[#0B0D1A]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* Accent discret et organique */}
          <motion.div
            key="curtain-accent"
            className="fixed inset-0 z-[9999] pointer-events-none"
            style={{
              background: `
                radial-gradient(60% 80% at 70% 30%, rgba(122,44,243,0.14) 0%, rgba(11,13,26,0) 60%),
                radial-gradient(40% 60% at 25% 70%, rgba(42,167,255,0.10) 0%, rgba(11,13,26,0) 55%),
                linear-gradient(135deg, #0B0D1A 0%, #10142A 60%, #131A28 100%)
              `,
            }}
            initial={{ opacity: 0.9, scale: 1, rotate: 0 }}
            animate={{ opacity: 0, scale: 1.06, rotate: -2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeMs / 1000, ease: [0.22, 1, 0.36, 1] }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
