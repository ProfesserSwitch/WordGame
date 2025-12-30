import React from "react";
import { motion } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { DISPLAY_NORMAL, FIXED_Y } from "../store/constants";
import { uiStyles } from "../styles/gameStyles";

interface EnemyEntityProps {
  enemy: any;
  index: number;
  animFrame: number;
  isTargeted: boolean;
  gameState: string;
  onSelect: (id: number) => void;
  assets: any;
  style?: React.CSSProperties; 
  onHover?: (isHover: boolean) => void;
  selectionCount?: number;
}

export const EnemyEntity: React.FC<EnemyEntityProps> = ({
  enemy,
  index,
  animFrame,
  isTargeted,
  gameState,
  onSelect,
  assets,
  style,
  onHover,
  selectionCount = 0,
}) => {
  const isAtk = enemy.atkFrame > 0;
  let sprite = isAtk
    ? enemy.atkFrame === 2
      ? assets.attackEnemy2
      : assets.attackEnemy1
    : gameState === "ADVANTURE"
    ? animFrame === 0
      ? assets.walkEnemy1
      : assets.walkEnemy2
    : assets.idleEnemy;

  // ✅ แก้ไขตรงนี้: เติม 'as const' เพื่อบอก Type ให้ชัดเจน
  const movementTransition = gameState === "QUIZ_MODE" 
    ? { duration: 10, ease: "linear" as const } 
    : { type: "tween" as const, duration: 0.2 };

  return (
    <motion.div
      // 1. INITIAL: เกิดมาเล็กๆ (Scale 0)
      initial={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 0, 
        opacity: 0,
      }}
      
      // 2. ANIMATE: ขยายร่างเต็ม (Scale 1)
      animate={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 1,
        opacity: 1,
      }}

      // 3. EXIT: หมุนติ้วปลิวลม
      exit={{
        x: 500,
        y: -1000,
        rotate: 1800,
        scale: 1, // ตอนตายให้หดหายไปก็ได้
        opacity: 1,
        transition: { duration: 0.4, ease: "easeIn" },
      }}

      // 4. ✅ TRANSITION CONFIG
      transition={{
        // default: ใช้ Spring (เด้งดึ๋ง) สำหรับ Scale และอื่นๆ
        default: { type: "spring", stiffness: 300, damping: 15 },
        
        // left: แยกมาคุมต่างหาก (แก้ Error ตรงนี้ด้วยตัวแปรข้างบน)
        left: movementTransition,

        // opacity: ให้ค่อยๆ ชัด
        opacity: { duration: 0.3 }
      }}

      onClick={(e) => {
        e.stopPropagation();
        onSelect(enemy.id);
      }}
      onMouseEnter={() => onHover && onHover(true)}
      onMouseLeave={() => onHover && onHover(false)}

      style={{
        position: "absolute",
        top: FIXED_Y,
        width: DISPLAY_NORMAL,
        height: DISPLAY_NORMAL,
        zIndex: 100 - index,
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        ...style, 
      }}
    >
      {/* HUD */}
      {enemy.hp > 0 && (
        <div style={{ position: "absolute", bottom: "105%", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "200px", pointerEvents: "none" }}>
          {(isTargeted || selectionCount > 0) && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 200 }}>
              <div style={{ width: "60px", height: "60px", border: "4px solid red", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(255, 0, 0, 0.2)", boxShadow: "0 0 15px red" }}>
                {selectionCount > 0 && <span style={{ color: "white", fontWeight: "bold", fontSize: "24px", textShadow: "2px 2px 0 #000" }}>{selectionCount > 1 ? `x${selectionCount}` : "TARGET"}</span>}
              </div>
            </motion.div>
          )}
          <ShoutBubble text={enemy.shoutText} />
          <HpBar hp={enemy.hp} max={enemy.maxHp} color="#ff4d4d" />
        </div>
      )}

      {/* Sprite */}
      <motion.div
        initial={{ scaleX: -1.5, scaleY: 1.5 }}
        animate={isAtk ? { scaleX: -1.5, scaleY: [1.5, 1.8, 1.5] } : { scaleX: -1.5, scaleY: 1.5 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{
          ...uiStyles.spriteLayer,
          backgroundImage: `url(${sprite})`,
          width: isAtk ? "160%" : "100%",
          height: "100%",
          position: "absolute",
          bottom: 0,
          left: "50%",
          marginLeft: isAtk ? "-80%" : "-50%",
          backgroundSize: "auto 100%",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transformOrigin: "bottom center",
        }}
      />
    </motion.div>
  );
};