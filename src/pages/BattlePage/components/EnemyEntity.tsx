import React from "react";
import { motion } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import { DISPLAY_NORMAL, DISPLAY_WIDE, FIXED_Y } from "../constants";
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

  // ✅ Props ใหม่
  onHover?: (isHover: boolean) => void;
  selectionCount?: number; // จำนวนครั้งที่ถูกเลือก (สำหรับ V-Missile ที่เลือกซ้ำได้)
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

  return (
    <motion.div
      initial={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 0,
        opacity: 0,
      }}
      animate={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 1,
        opacity: 1,
      }}
      exit={{
        x: 500,
        y: -1000,
        rotate: 1800,
        scale: 0,
        opacity: 0,
        transition: { duration: 0.4, ease: "easeIn" },
      }}
      transition={{
        left: { type: "tween", duration: 0.2 },
        default: { type: "spring", stiffness: 400, damping: 15 },
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(enemy.id);
      }}
      // ✅ Handle Hover
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
      {/* 3. ส่วน HUD ลอยเหนือหัว */}
      {enemy.hp > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "105%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            width: "200px",
            pointerEvents: "none",
          }}
        >
          {/* ✅ แสดงเป้าเล็ง (Crosshair) หรือ ตัวเลขลำดับ ถ้าถูกเลือก */}
          {(isTargeted || selectionCount > 0) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: "absolute",
                top: "50%", // เลื่อนลงมาทับตัวศัตรู
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 200,
                pointerEvents: "none",
              }}
            >
              {/* วงกลมเป้าเล็ง */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "4px solid red",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "rgba(255, 0, 0, 0.2)",
                  boxShadow: "0 0 15px red",
                }}
              >
                {/* แสดงตัวเลขจำนวนครั้งที่เลือก (ถ้าเลือกมากกว่า 1 ครั้ง หรือเป็นลำดับ) */}
                {selectionCount > 0 && (
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "24px",
                      textShadow: "2px 2px 0 #000",
                    }}
                  >
                    {selectionCount > 1 ? `x${selectionCount}` : "TARGET"}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          <ShoutBubble text={enemy.shoutText} />
          <HpBar hp={enemy.hp} max={enemy.maxHp} color="#ff4d4d" />
        </div>
      )}

      {/* 4. Sprite ตัวละคร */}
      <div
        style={{
          ...uiStyles.spriteLayer,
          backgroundImage: `url(${sprite})`,
          width: "100%",
          height: "100%",
          backgroundSize: "contain",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          transform: "scale(1.5) scaleX(-1)",
        }}
      />
    </motion.div>
  );
};
