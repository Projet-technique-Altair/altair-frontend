import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatorActivationModal from "@/components/user/CreatorActivationModal";
import { useAuth } from "@/context/AuthContext";
import { ALT_COLORS } from "@/lib/theme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, switchRole } = useAuth();
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [username, setUsername] = useState(user?.username ?? "");
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  const handleActivateCreator = () => {
    switchRole("creator");
    setShowCreatorModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#121726] border border-white/10 rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg text-white"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <h2
            className="text-2xl font-bold mb-4 text-transparent bg-clip-text"
            style={{
              background: `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
            }}
          >
            Paramètres du compte
          </h2>

          {/* === USERNAME === */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />
          </div>

          {/* === LANGUAGE === */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Langue préférée
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#1A1F2E] border border-white/10 rounded-lg px-4 py-2 w-full focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* === MODE CRÉATEUR === */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {user?.role === "creator"
                  ? "✅ Vous êtes déjà en mode créateur."
                  : "✨ Activez le mode créateur pour publier vos labs."}
              </p>
            </div>

            {user?.role === "creator" ? (
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-sky-400 text-white text-sm font-semibold hover:opacity-90 transition"
                onClick={onClose}
              >
                OK
              </button>
            ) : (
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-400 text-white text-sm font-semibold hover:opacity-90 transition"
                onClick={() => setShowCreatorModal(true)}
              >
                Activer
              </button>
            )}
          </div>

          {/* === CLOSE BUTTON === */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Fermer
            </button>
          </div>
        </motion.div>

        {/* === CREATOR MODAL === */}
        {showCreatorModal && (
          <CreatorActivationModal
            onClose={() => setShowCreatorModal(false)}
            onActivate={handleActivateCreator} // ✅ Correction ici
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
