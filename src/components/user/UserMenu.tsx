// src/components/user/UserMenu.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, User, Sparkles } from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Profil",
      icon: <User className="w-4 h-4 text-sky-400" />,
      action: () => navigate("/learner/profile"),
    },
    {
      label: "Paramètres",
      icon: <Settings className="w-4 h-4 text-purple-400" />,
      action: () => navigate("/learner/settings"),
    },
    {
      label: "Mode Créateur",
      icon: <Sparkles className="w-4 h-4 text-orange-400" />,
      action: () => navigate("/learner/settings#creator"),
    },
  ];

  return (
    <div className="relative">
      {/* === Bouton principal === */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#111827] rounded-full px-3 py-1.5 border border-white/10 hover:border-purple-400/30 transition"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-orange-400 text-sm font-semibold flex items-center justify-center">
          G
        </div>
        <span className="text-sm text-gray-200">guest • student</span>
      </button>

      {/* === Menu déroulant === */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
          >
            {/* === Options principales === */}
            <div className="flex flex-col py-2">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/5 transition"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* === Séparation === */}
            <div className="border-t border-white/10 my-1" />

            {/* === Déconnexion === */}
            <button
              onClick={() => {
                setOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Déconnexion</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
