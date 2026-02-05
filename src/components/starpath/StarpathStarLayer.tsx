import React from "react";
import star from "@/assets/star.png";

export default function StarpathStarLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <img
        src={star}
        alt=""
        draggable={false}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        style={{
          width: 180,
          height: 180,
          imageRendering: "auto",
        }}
      />
    </div>
  );
}
