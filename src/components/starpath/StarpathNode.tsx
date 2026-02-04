import { motion } from "framer-motion";

interface StarpathNodeProps {
  name: string;
  status: "completed" | "current" | "locked";
  side: "left" | "right";
}

export default function StarpathNode({ name, status, side }: StarpathNodeProps) {
  const colorMap = {
    completed: "from-sky-400 to-purple-400",
    current: "from-orange-400 to-pink-500",
    locked: "from-gray-600 to-gray-800",
  };

  const icon =
    status === "completed"
      ? "✅"
      : status === "current"
      ? "🚀"
      : "🔒";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex items-center ${
        side === "left" ? "justify-start" : "justify-end"
      } w-full`}
    >
      <div
        className={`flex flex-col items-center gap-2 ${
          side === "left" ? "text-left" : "text-right"
        }`}
      >
        <span className="text-xs text-gray-300 w-40">{name}</span>
        <div
          className={`p-[2px] rounded-full bg-gradient-to-r ${colorMap[status]} w-5 h-5`}
        >
          <div className="w-full h-full bg-[#0B0F19] rounded-full flex items-center justify-center text-[10px]">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
