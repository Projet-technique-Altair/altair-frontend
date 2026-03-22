import { useNavigate } from "react-router-dom";

interface CreatorStarpathCardProps {
  starpath: any;
}

export default function CreatorStarpathCard({
  starpath,
}: CreatorStarpathCardProps) {

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/creator/starpath/${starpath.starpath_id}`)}
      className="
        group relative flex flex-col justify-between
        rounded-2xl bg-[#111827]/70 border border-white/10 p-6
        shadow-[0_0_15px_rgba(0,0,0,0.25)]
        hover:border-orange-400/40 hover:shadow-[0_0_25px_rgba(251,146,60,0.35)]
        transition-all duration-300 cursor-pointer h-[200px]
      "
    >
      {/* HEADER */}
      <div>

        <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">
          {starpath.name}
        </h3>

        <p className="text-xs text-gray-400 mt-1">
          Created on {new Date(starpath.created_at).toLocaleDateString("en-GB")}
        </p>

      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col justify-center gap-2 text-sm text-gray-300">

        <div className="flex gap-2">
          <span className="text-gray-400">Difficulty:</span>
          <span className="text-white">{starpath.difficulty ?? "—"}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400">Labs:</span>
          <span className="text-white">{starpath.labs_count ?? "—"}</span>
        </div>

        <div className="flex gap-2">
          <span className="text-gray-400">Visibility:</span>
          <span className="text-white">{starpath.visibility ?? "—"}</span>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        ID: <span className="text-white/70">{starpath.starpath_id}</span>
      </div>

    </div>
  );
}