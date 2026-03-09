import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

interface CreatorGroupCardProps {
  group: any;
  onDelete?: () => void;
}

export default function CreatorGroupCard({
  group,
  onDelete,
}: CreatorGroupCardProps) {

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/creator/group/${group.group_id}`)}
      className="
        group relative flex flex-col justify-between
        rounded-2xl bg-[#111827]/70 border border-white/10 p-6
        shadow-[0_0_15px_rgba(0,0,0,0.25)]
        hover:border-purple-400/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]
        transition-all duration-300 cursor-pointer h-[200px]
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
            {group.name}
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Created on {new Date(group.created_at).toLocaleDateString("en-GB")}
          </p>
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg bg-[#1A1F2E] hover:bg-[#23283a]"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        )}

      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col justify-center gap-2 text-sm text-gray-300">

        <div className="flex gap-2">
          <span className="text-gray-400">Members:</span>
          <span className="text-white">{group.members_count ?? "—"}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400">Labs:</span>
          <span className="text-white">{group.labs_count ?? "—"}</span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        ID: <span className="text-white/70">{group.group_id}</span>
      </div>

    </div>
  );
}