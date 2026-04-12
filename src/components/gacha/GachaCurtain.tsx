import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  mode: "fade-in" | "fade-out";
  durationMs?: number;
};

export default function GachaCurtain({
  mode,
  durationMs = 900,
}: Props) {
  const [visible, setVisible] = useState(mode === "fade-out");

  useEffect(() => {
    if (mode !== "fade-out") {
      return;
    }

    const timeout = window.setTimeout(() => setVisible(false), 40);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  if (mode === "fade-in") {
    return (
      <>
        <motion.div
          className="pointer-events-none fixed inset-0 z-[140] bg-[#0B0D1A]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="pointer-events-none fixed inset-0 z-[141]"
          style={{
            background: `
              radial-gradient(60% 80% at 70% 30%, rgba(122,44,243,0.14) 0%, rgba(11,13,26,0) 60%),
              radial-gradient(40% 60% at 25% 70%, rgba(42,167,255,0.10) 0%, rgba(11,13,26,0) 55%),
              linear-gradient(135deg, #0B0D1A 0%, #10142A 60%, #131A28 100%)
            `,
          }}
          initial={{ opacity: 0, scale: 1, rotate: 0 }}
          animate={{ opacity: 1, scale: 1.04, rotate: -1.5 }}
          transition={{ duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
      </>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="gacha-curtain-base"
            className="pointer-events-none fixed inset-0 z-[140] bg-[#0B0D1A]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            key="gacha-curtain-accent"
            className="pointer-events-none fixed inset-0 z-[141]"
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
            transition={{ duration: durationMs / 1000, ease: [0.22, 1, 0.36, 1] }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
