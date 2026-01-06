import React from "react";
import { motion } from "framer-motion";
import type { Projectile as ProjectileType } from "../types/index";

interface Props {
  data: ProjectileType;
}

export const ProjectileEntity: React.FC<Props> = ({ data }) => {
  
  if (data.visual === 'FIREBALL') {
    return (
      <motion.div
        style={{
          position: "absolute",
          left: `${data.x}%`,
          top: data.y,
          width: `${40 * (data.scale || 1)}px`, 
          height: `${40 * (data.scale || 1)}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff700 10%, #ff8c00 40%, #ff4500 90%)",
          boxShadow: "0 0 20px 8px rgba(255, 69, 0, 0.6)", 
          zIndex: 200,
          transform: "translate(-50%, -50%)", 
          pointerEvents: "none",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
      />
    );
  }

  // Default / V-Shape Style
  return (
    <div
      style={{
        position: "absolute",
        left: `${data.x}%`,
        top: data.y,
        // หมุนตามค่า rotation ที่ส่งมาจาก store
        transform: `translateY(-50%) rotate(${data.rotation || 0}deg)`,
        zIndex: 15,
        pointerEvents: "none",
        color: "#e9d5ff",
        fontWeight: "900",
        fontSize: "32px",
        fontFamily: "'Courier New', monospace",
        textShadow: `0 0 5px #e9d5ff, 0 0 10px #c084fc, 0 0 20px #9333ea`,
        whiteSpace: "nowrap",
        letterSpacing: "2px",
        transformOrigin: "center center",
      }}
    >
      {/* ถ้าเป็น V-Shape ให้แสดง > ถ้าไม่ก็แสดง char ปกติ */}
      {data.visual === 'V_SHAPE' ? '>' : data.char}
    </div>
  );
};