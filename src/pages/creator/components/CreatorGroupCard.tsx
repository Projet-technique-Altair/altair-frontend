import { useNavigate } from "react-router-dom";
import { Trash2, ChevronRight, Users } from "lucide-react";
import { motion } from "framer-motion";

import DashboardCard from "@/components/ui/DashboardCard";
import ReportButton from "@/components/moderation/ReportButton";

/* =========================
   TYPES
========================= */

interface CreatorGroupCardProps {
  group: {
    group_id: string;
    name: string;
    created_at: string;
    members_count?: number;
    labs_count?: number;
  };
  onDelete?: () => void;
}

/* =========================
   COMPONENT
========================= */

export default function CreatorGroupCard({
  group,
  onDelete,
}: CreatorGroupCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DashboardCard
        onClick={() => navigate(`/creator/group/${group.group_id}`)}
        className="
          group relative overflow-hidden p-5 cursor-pointer
          hover:bg-white/[0.06] transition
          border border-white/10
        "
      >
        {/* GLOW */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-400/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

        {/* HEADER */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">
              Group
            </p>

            <h3 className="mt-1 text-sm font-medium text-white truncate group-hover:text-violet-300 transition">
              {group.name}
            </h3>

            <p className="mt-2 text-xs text-white/40">
              {group.created_at
                ? new Date(group.created_at).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>

          {/* ACTION */}
          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {onDelete && (
              <button
                onClick={onDelete}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-xl border border-white/10 bg-white/[0.04]
                  hover:bg-white/[0.08] transition
                "
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            )}
            <ReportButton
              targetType="group"
              targetId={group.group_id}
              targetLabel={group.name}
              compact
            />
          </div>
        </div>

        {/* BODY */}
        <div className="relative mt-5 space-y-2 text-xs text-white/55">
          <InfoRow label="Members" value={group.members_count} />
          <InfoRow label="Labs" value={group.labs_count} />
        </div>

        {/* FOOTER */}
        <div className="relative mt-5 flex items-center justify-between">
          <div className="text-[11px] text-white/30 truncate">
            {group.group_id}
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
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/40">{label}</span>
      <span className="text-white">{value ?? "—"}</span>
    </div>
  );
}
