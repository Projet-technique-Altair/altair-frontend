import React from "react";

interface StarNodeProps {
  left: number;
  label: string;
  status: "completed" | "current" | "locked" | "pending";
}

export default function StarNode({ left, label, status }: StarNodeProps) {
  const color =
    status === "completed"
      ? "bg-gradient-to-r from-sky-400 to-purple-400"
      : status === "current"
      ? "bg-orange-400 animate-pulse"
      : status === "locked"
      ? "bg-gray-700 opacity-40"
      : "bg-white/10";

  return (
    <div
      className="absolute -top-3 flex flex-col items-center"
      style={{ left: `${left}%`, transform: "translateX(-50%)" }}
    >
      <div
        className={`w-5 h-5 rounded-full ${color} border border-white/10 shadow-md`}
        title={label}
      />
      <span className="text-[10px] mt-2 text-gray-400">{label}</span>
    </div>
  );
}
