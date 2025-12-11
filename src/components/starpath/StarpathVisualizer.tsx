import React from "react";
import StarNode from "./StarNode";
import { Starpath } from "@/api/mockStarpaths";
import { ALT_COLORS } from "@/lib/theme";

export default function StarpathVisualizer({ data }: { data: Starpath }) {
  const gradient = `linear-gradient(90deg, ${ALT_COLORS.blue}, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`;
  const nodeCount = data.nodes.length;
  const positions = data.nodes.map((_, i) =>
    nodeCount > 1 ? (i / (nodeCount - 1)) * 100 : 50
  );

  return (
    <div className="relative w-full py-8">
      <div className="mb-3 flex justify-between items-center">
        <h2 className="text-white font-medium text-lg">{data.name}</h2>
        <span className="text-sky-400 text-sm">{data.progress}%</span>
      </div>

      {/* Ligne principale */}
      <div className="relative h-2 bg-[#0E1323] rounded-full overflow-hidden">
        <div
          className="absolute h-2 top-0 left-0 rounded-full"
          style={{ width: `${data.progress}%`, background: gradient }}
        />
      </div>

      {/* Nœuds */}
      <div className="relative h-10 mt-4">
        {data.nodes.map((node, idx) => {
          const left = positions[idx];
          let status: "completed" | "current" | "locked" | "pending" = "pending";

          if (node.completed) status = "completed";
          else if (idx <= Math.floor((data.progress / 100) * (nodeCount - 1)))
            status = "current";
          else if (node.locked) status = "locked";

          return (
            <StarNode key={node.id} left={left} label={node.name} status={status} />
          );
        })}
      </div>
    </div>
  );
}
