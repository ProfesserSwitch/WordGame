import React, { useState } from "react";
import { motion } from "framer-motion";
import type { GameState, DictEntry, PlayerStat, SkillData } from "../types";

// ✅ แก้ Import: ดึงมาจาก GameApp โดยตรง (เพราะเราเอามารวมไว้ที่นั่นแล้ว)
import { SKILL_DATABASE } from "../data/skills"; 

// --- Sub-Component: SkillButton ---
const SkillButton = ({
  label,
  subLabel,
  cost,
  color,
  onClick,
  disabled,
  icon,
  height = "50px", 
}: {
  label: string;
  subLabel?: string;
  cost?: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
  icon?: string;
  height?: string;
}) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, filter: "brightness(1.1)" } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      style={{
        width: "100%",
        height: height,
        minHeight: height,
        border: `2px solid ${disabled ? "#444" : "#000"}`,
        borderRadius: "6px",
        background: disabled
          ? "#2a2a2a"
          : `linear-gradient(135deg, #2e2019 0%, ${color} 100%)`,
        color: disabled ? "#555" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: disabled ? "none" : "0 4px 6px rgba(0,0,0,0.3)",
        opacity: disabled ? 0.7 : 1,
        marginBottom: "0", 
        padding: 0,
        flexShrink: 0,
      }}
    >
      {/* Icon Area */}
      <div
        style={{
          width: "40px",
          height: "100%",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          borderRight: "1px solid rgba(0,0,0,0.2)",
        }}
      >
        {icon || "⚔️"}
      </div>

      {/* Text Area */}
      <div
        style={{
          flex: 1,
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden", 
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            textShadow: "1px 1px 0 #000",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
            textAlign: "left"
          }}
        >
          {label}
        </span>
        {subLabel && (
          <span style={{ fontSize: "9px", opacity: 0.8 }}>{subLabel}</span>
        )}
      </div>

      {/* Cost Area */}
      {cost && (
        <div
          style={{
            padding: "4px 6px",
            fontSize: "10px",
            fontWeight: "bold",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "4px",
            marginRight: "5px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {cost}
        </div>
      )}
    </motion.button>
  );
};

// --- Main Component ---
interface SkillBarProps {
  playerStat: PlayerStat;
  gameState: GameState;
  validWordInfo: DictEntry | null;
  currentWordLength: number;
  targetingMode: boolean;
  onSkillClick: (skill: SkillData) => void;
  onEndTurn: () => void;
  onSpin: () => void;
}

type TabType = "ACTION" | "BAG";

export const SkillBar: React.FC<SkillBarProps> = ({
  playerStat,
  gameState,
  validWordInfo,
  currentWordLength,
  targetingMode,
  onSkillClick,
  onSpin,
  onEndTurn,
}) => {
  const isPlayerTurn = gameState === "PLAYERTURN";
  const hasWord = !!validWordInfo;
  const [activeTab, setActiveTab] = useState<TabType>("ACTION");

  const getSkillColor = (type: string) => {
    switch (type) {
      case "DAMAGE": return "#d32f2f";
      case "SHIELD": return "#1976d2";
      case "SPIN": return "#fbc02d";
      case "HEAL": return "#388e3c";
      default: return "#5d4037";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#2e2019",
        border: "3px solid #5c4033",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
      }}
    >
      {/* 1. HEADER (Stats) */}
      <div style={{ background: "#1a120b", padding: "10px", borderBottom: "2px solid #5c4033", display: "flex", flexDirection: "column", gap: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#fff", fontWeight: "bold", fontFamily: "monospace" }}>
          <span>PLAYER</span><span>LV. 1</span>
        </div>
        
        {/* HP Bar */}
        <div style={{ position: "relative", width: "100%", height: "14px", background: "#444", borderRadius: "7px", overflow: "hidden", border: "1px solid #000" }}>
          <div style={{ width: `${Math.max(0, (playerStat.hp / playerStat.max_hp) * 100)}%`, height: "100%", background: "#ff4d4d", transition: "width 0.3s" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000" }}>
            {playerStat.hp} / {playerStat.max_hp}
          </div>
        </div>
        
        {/* MP BAR */}
        <div style={{ position: "relative", width: "100%", height: "6px", background: "#222", borderRadius: "3px", overflow: "hidden", border: "1px solid #444", marginTop: "2px" }}>
           <div style={{ width: `${Math.min(100, (playerStat.mp / (playerStat.max_mp || 1)) * 100)}%`, height: "100%", background: "#2979ff", transition: "width 0.3s" }} />
        </div>

        {/* RP & Shield */}
        <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
          {/* ✅ แสดง RP แทน AP */}
          <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "#aaa", marginRight: "2px" }}>RP:</span>
            {Array.from({ length: playerStat.max_rp }).map((_, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < playerStat.rp ? "#ffd700" : "#555", border: "1px solid #000", boxShadow: i < playerStat.rp ? "0 0 4px #ffd700" : "none" }} />
            ))}
          </div>
          {playerStat.shield > 0 && (
            <div style={{ background: "#00bcd4", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", color: "#000", border: "1px solid #fff" }}>🛡 {playerStat.shield}</div>
          )}
        </div>
      </div>

      {/* 2. TABS */}
      <div style={{ display: "flex", background: "#3e2723", borderBottom: "2px solid #5c4033" }}>
        <div style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", fontWeight: "bold", fontSize: "12px", color: activeTab === "ACTION" ? "#fff" : "#8d6e63", background: activeTab === "ACTION" ? "#5c4033" : "transparent" }} onClick={() => setActiveTab("ACTION")}>ACTION</div>
        <div style={{ flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer", fontWeight: "bold", fontSize: "12px", color: activeTab === "BAG" ? "#fff" : "#8d6e63", background: activeTab === "BAG" ? "#5c4033" : "transparent" }} onClick={() => setActiveTab("BAG")}>BAG</div>
      </div>

{/* 3. CONTENT AREA */}
      <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column", overflowY: "auto", background: "linear-gradient(180deg, #3e2723 0%, #2e2019 100%)", gap: "8px" }}>
        {activeTab === "ACTION" ? (
          <>
            {SKILL_DATABASE.map((skill: any) => {
              let isDisabled = !isPlayerTurn || targetingMode;

              // ❌ ไม่เช็ค AP แล้ว
              // เช็ค MP (ถ้าต้องใช้)
              if ((skill.mpCost || 0) > 0 && playerStat.mp < skill.mpCost) isDisabled = true;

              // เช็คจำนวนตัวอักษร
              if ((skill.minWordLength || 0) > 0) {
                if (!hasWord) isDisabled = true;
                if (currentWordLength < skill.minWordLength) isDisabled = true;
              }

              // สร้าง Text แสดง Cost/Gain
              let costText = "";
              if (skill.mpCost > 0) costText += `${skill.mpCost} MP`; 
              
              let subText = skill.description;
              if (skill.mpGain > 0) subText = `(+${skill.mpGain} MP) ${subText}`;

              return (
                <SkillButton
                  key={skill.id}
                  label={skill.name}
                  subLabel={subText}
                  cost={costText}
                  color={getSkillColor(skill.effectType)}
                  icon={skill.icon}
                  disabled={isDisabled}
                  onClick={() => onSkillClick(skill)}
                />
              );
            })}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>🎒</div>
            <div style={{ color: "#aaa", fontSize: "12px" }}>Inventory Empty</div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM ACTION ROW */}
      <div style={{ padding: "10px", background: "#1a120b", borderTop: "2px solid #5c4033", display: "flex", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <SkillButton
                // ✅ แสดงจำนวนสปินที่เหลือใน Label
                label={`SPIN (${playerStat.rp})`}
                color="#fbc02d" 
                icon="🎲"
                // ✅ ปิดปุ่มถ้า RP หมด หรือไม่ใช่เทิร์นเรา
                disabled={!isPlayerTurn || targetingMode || playerStat.rp <= 0}
                onClick={onSpin}
                height="45px" 
            />
          </div>
          <div style={{ flex: 1 }}>
            <SkillButton
                label="END"
                color="#d32f2f" 
                icon="⏳"
                disabled={!isPlayerTurn || targetingMode}
                onClick={onEndTurn}
                height="45px"
            />
          </div>
      </div>
    </div>
  );
};