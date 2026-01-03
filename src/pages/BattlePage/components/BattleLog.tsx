import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "danger" | "special" | "combat";
  timestamp: number;
  message?: string;
  combat?: {
    attacker: string;
    target: string;
    skill: string;
    damage: number;
  };
}

interface BattleLogProps {
  logs: LogEntry[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getColor = (type: string) => {
    switch (type) {
      case "success": return "#00b894";
      case "warning": return "#fdcb6e";
      case "danger": return "#ff7675";
      case "special": return "#a29bfe";
      case "combat": return "#dfe6e9";
      default: return "#dfe6e9";
    }
  };

  return (
    <div
      style={{
        boxSizing: "border-box", // ✅ เพิ่มบรรทัดนี้ เพื่อให้รวม Padding ในความสูง
        flex: 1,
        height: "100%",
        // --- ธีมเดิม (Dark Wood & Gold) ---
        background: "#2e2019", 
        border: "3px double #eebb55", 
        borderRadius: "8px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)",
        overflow: "hidden",
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        minWidth: "200px"
      }}
    >
      <div style={{ 
          borderBottom: "1px solid #5c4033", 
          marginBottom: "5px", 
          paddingBottom: "5px", 
          color: "#eebb55", 
          fontWeight: "bold", 
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "1px"
      }}>
        📜 Battle Log
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "5px" }} className="custom-scrollbar">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  color: getColor(log.type),
                  textShadow: "1px 1px 0 #000",
                  lineHeight: "1.5",
                  borderBottom: "1px dashed rgba(255,255,255,0.1)",
                  paddingBottom: "4px"
                }}
              >
                <span style={{ opacity: 0.5, fontSize: "10px", marginRight: "5px", verticalAlign: "top" }}>
                   [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" })}]
                </span>

                {log.type === "combat" && log.combat ? (
                  <div style={{ display: "inline-block", verticalAlign: "top", width: "85%" }}>
                    <div style={{ marginBottom: "2px" }}>
                      <span style={{ color: "#74b9ff" }}>{log.combat.attacker}</span> 
                      {" "}ใช้ท่า{" "}
                      <span style={{ color: "#eebb55", fontWeight: "bold" }}>"{log.combat.skill}"</span>
                      {" "}ใส่{" "}
                      <span style={{ color: "#ff7675" }}>{log.combat.target}</span>
                    </div>
                    <div style={{ color: "#fab1a0" }}>
                      สร้างความเสียหาย <b style={{ color: "#fff" }}>{log.combat.damage}</b> หน่วย
                    </div>
                  </div>
                ) : (
                  <span style={{ verticalAlign: "top" }}>{log.message}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};