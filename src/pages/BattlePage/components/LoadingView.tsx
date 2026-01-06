import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ✅ ตรวจสอบ Path ของรูปภาพให้ถูกต้องตามโครงสร้างโฟลเดอร์ของคุณ
import walkEnemy1 from "../../../assets/image/player/walk/1.png";
import walkEnemy2 from "../../../assets/image/player/walk/2.png";

// ✅ 1. เพิ่ม Interface เพื่อบอกว่า Component นี้รับค่า progress เป็น number
interface LoadingViewProps {
  progress?: number; // ใส่ ? เผื่อไว้กรณีไม่ได้ส่งค่ามา จะได้ไม่ Error
}

// ✅ 2. รับ props เข้ามาใน Component
const LoadingView: React.FC<LoadingViewProps> = ({ progress = 0 }) => {
  // State สำหรับสลับเฟรมเดิน (Animation Frame)
  const [frame, setFrame] = useState(0);

  // Loop สลับรูปทุกๆ 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#121212",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#eebb55",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* พื้นหลังจางๆ */}
      <div
        style={{
          position: "absolute",
          bottom: "40%",
          width: "100%",
          height: "2px",
          background: "#333",
        }}
      ></div>

      {/* ตัวละครเดิน */}
      <div style={{ position: "relative", marginBottom: "30px" }}>
        {/* เงาใต้เท้า */}
        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            left: "10%",
            width: "80%",
            height: "10px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />

        {/* รูปตัวละคร (ใช้ Framer Motion ให้เด้งนิดๆ ตอนเดิน) */}
        <motion.img
          key={frame} // บังคับ Re-render เมื่อเปลี่ยนเฟรม
          src={frame === 0 ? walkEnemy1 : walkEnemy2}
          alt="Loading..."
          style={{
            width: "64px",
            height: "64px",
            imageRendering: "pixelated", // ให้ภาพคมแบบ Pixel Art
            position: "relative",
            zIndex: 2,
          }}
          animate={{ y: [0, -4, 0] }} // เด้งขึ้นลง
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Text Loading + Progress % */}
      <h2
        style={{
          fontFamily: "monospace",
          letterSpacing: "4px",
          fontSize: "24px",
          textShadow: "0 0 10px rgba(238, 187, 85, 0.5)",
        }}
      >
        LOADING... {progress}%
      </h2>

      {/* ✅ 3. ส่วนแสดงหลอดโหลด (Progress Bar) */}
      <div
        style={{
          width: "300px",
          height: "10px",
          background: "#333",
          borderRadius: "5px",
          marginTop: "15px",
          overflow: "hidden",
          border: "1px solid #555",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }} // ขยับความกว้างตาม progress
          transition={{ ease: "easeOut", duration: 0.2 }}
          style={{
            height: "100%",
            background: "#00e676",
          }}
        />
      </div>

      <p
        style={{
          color: "#666",
          fontSize: "12px",
          marginTop: "10px",
          fontFamily: "monospace",
        }}
      >
        {progress < 20 ? "Connecting to Dictionary..." : "Preloading Assets..."}
      </p>
    </div>
  );
};

export default LoadingView;