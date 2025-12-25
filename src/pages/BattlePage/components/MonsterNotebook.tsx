import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Enemy } from "../types";

interface MonsterNotebookProps {
  target: Enemy | undefined;
}

export const MonsterNotebook: React.FC<MonsterNotebookProps> = ({ target }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "95%",
        background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)",
        borderRadius: "12px",
        border: "3px solid #eebb55",
        boxShadow: "0 10px 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px", // ลด Padding รอบนอก
      }}
    >
      <div
        style={{
          color: "#eebb55",
          fontSize: "12px",
          fontWeight: 900,
          letterSpacing: "2px",
          borderBottom: "2px solid #eebb55",
          width: "100%",
          textAlign: "center",
          paddingBottom: "5px",
          marginBottom: "5px",
          textShadow: "0 2px 0 #000",
        }}
      >
        MONSTER LOG
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          position: "relative",
          background: "#fdfbf7",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            // ✅ ลด Padding ซ้ายขวา เพื่อให้ข้อความชิดขอบได้มากขึ้น ไม่ตกบรรทัดง่าย
            padding: "10px 5px 10px 20px", 
            backgroundSize: "100% 24px",
            backgroundAttachment: "local",
            fontFamily: "'Courier New', monospace",
            fontSize: "13px",
            color: "#333",
            lineHeight: "24px",
          }}
        >


          <AnimatePresence mode="wait">
            {target ? (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.3 }}
              >

                <div style={{ fontWeight: "bold", color: "#b22222", fontSize: "11px" }}>
                  WANTED:
                </div>
                <div style={{ fontSize: "13px", fontWeight: "900", marginBottom: "0" }}>
                  {target.name}
                </div>
                <div>HP:{Math.ceil(target.hp)}/{target.maxHp}</div>
                <div>ATK:{target.atk_power_min}-{target.atk_power_max}</div>
                <div style={{ color: "#d2691e", fontWeight: "bold" }}>LVL:{target.level}</div>
                
                <div style={{ borderBottom: "2px dashed #333", marginTop: "5px", opacity: 0.5 }} />
                <div style={{ fontSize: "10px", marginTop: "2px", fontStyle: "italic", opacity: 0.7 }}>
                  "Check spelling..."
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                style={{ textAlign: "center", paddingTop: "40px", fontStyle: "italic", fontSize: "12px" }}
              >
                Select target...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};