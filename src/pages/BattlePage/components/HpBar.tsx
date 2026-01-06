import React from "react";

interface HpBarProps {
  hp: number;
  max: number;
  color: string;
}

export function HpBar({ hp, max, color }: HpBarProps) {
  const percent = Math.max(0, Math.min(100, (hp / max) * 100));

  return (
    <div
      style={{
        position: "relative",
        width: "70%", 
        height: "100%", 
        background: "#333",
        border: "2px solid #000",
        borderRadius: "4px",
        overflow: "hidden",
        boxShadow: "0 2px 0 rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Bar Fill */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          width: `${percent}%`,
          background: color,
          transition: "width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)",
        }}
      />

      {/* Text Overlay */}
      <span
        style={{
          position: "relative",
          fontSize: "9px",
          fontWeight: "900",
          color: "#fff",
          textShadow: "1px 1px 0 #000",
          zIndex: 5,
          lineHeight: 1,
          fontFamily: "monospace, sans-serif"
        }}
      >
        {/* ✅ แก้ตรงนี้: แสดงทศนิยม 1 ตำแหน่ง (ตัด 0 ข้างหลังออกถ้าไม่จำเป็น) */}
        {parseFloat(hp.toFixed(1))}/{max}
      </span>
    </div>
  );
}