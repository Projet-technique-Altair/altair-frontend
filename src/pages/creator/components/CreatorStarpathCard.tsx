import { useNavigate } from "react-router-dom";
import { ChevronRight, Orbit } from "lucide-react";
import { motion } from "framer-motion";

import DashboardCard from "@/components/ui/DashboardCard";

/* =========================
   TYPES
========================= */

interface CreatorStarpathCardProps {
  starpath: {
    starpath_id: string;
    name: string;
    created_at: string;
    difficulty?: string;
    labs_count?: number;
    visibility?: string;
  };
}

/* =========================
   COMPONENT
========================= */

export default function CreatorStarpathCard({
  starpath,
}: CreatorStarpathCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardCard
        onClick={() =>
          navigate(`/creator/starpath/${starpath.starpath_id}`)
        }
        className="
          group relative overflow-hidden p-5 cursor-pointer
          hover:bg-white/[0.06] transition
          border border-white/10
        "
      >
        {/* SAME GLOW */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-400/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* HEADER */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">
              Starpath
            </p>

            <h3 className="mt-1 text-sm font-medium text-white truncate group-hover:text-violet-300 transition">
              {starpath.name}
            </h3>

            <p className="mt-2 text-xs text-white/40">
              {starpath.created_at
                ? new Date(starpath.created_at).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="relative mt-5 space-y-2 text-xs text-white/55">
          <InfoRow label="Difficulty" value={starpath.difficulty} capitalize />
          <InfoRow label="Labs" value={starpath.labs_count} />
          <InfoRow label="Visibility" value={starpath.visibility} capitalize />
        </div>

        {/* FOOTER */}
        <div className="relative mt-5 flex items-center justify-between">
          <div className="text-[11px] text-white/30 truncate">
            {starpath.starpath_id}
          </div>

          <ChevronRight className="h-4 w-4 text-white/25 group-hover:text-white/60 transition" />
        </div>
      </DashboardCard>
    </motion.div>
  );
}

/* =========================
   SUB COMPONENT
========================= */

function InfoRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string | number | undefined;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/40">{label}</span>
      <span className={`text-white ${capitalize ? "capitalize" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}