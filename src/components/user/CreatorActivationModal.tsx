import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreatorActivationModalProps {
  onClose: () => void;
  onActivate: () => void; // ✅ ajoutée
}

export default function CreatorActivationModal({
  onClose,
  onActivate,
}: CreatorActivationModalProps) {
  // bloque le scroll quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#121726] border border-purple-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center text-white"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <h2 className="text-2xl font-bold text-purple-400 mb-3">
            Activer le Mode Créateur
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            En activant ce mode, vous pourrez créer vos propres labs, scénarios et
            starpaths interactifs.  
            <br />
            Vous pourrez aussi suivre les retours et évaluations de vos étudiants.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#1F2433] text-gray-300 hover:bg-[#262b3d] transition"
            >
              Annuler
            </button>

            <button
              onClick={onActivate}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 font-semibold text-white hover:opacity-90 transition"
            >
              ✨ Activer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
