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
      // ✅ แก้ไขส่วน initial: ให้เริ่มจากเล็ก (0) และจาง (0)
      initial={{
        left: `${enemy.x}%`,
        x: "-50%",
        y: "-100%",
        scale: 0,   // 👈 แก้จาก 1 เป็น 0 (เพื่อให้เด้งขยายขึ้นมา)
        opacity: 0, // 👈 แก้จาก 1 เป็น 0 (เพื่อให้ค่อยๆ ชัดขึ้น)
      }}
      // ✅ ส่วน animate: ให้ขยายมาเท่าขนาดจริง (1)
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
        scale: 1, // ตอนตายให้หดหายไปก็ได้
        opacity: 1,
        transition: { duration: 0.4, ease: "easeIn" },
      }}
      // ✅ Transition เดิมของคุณดีอยู่แล้ว (Spring) มันจะเด้งดึ๋งเพราะตัวนี้
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

        {/* 4. Sprite ตัวละคร (ใช้ motion.div แทน div ธรรมดา) */}
        <motion.div
          // ✅ กำหนด Animation State
          // ถ้าโจมตี (isAtk): ให้ scaleY เด้งจาก 1.5 -> 1.8 -> 1.5 (เหมือนผู้เล่น)
          // ถ้าปกติ: ให้กลับมาที่ 1.5
          // *สำคัญ: ต้องคง scaleX ไว้ที่ -1.5 เสมอเพื่อให้หันหน้าไปทางซ้าย*
          initial={{ scaleX: -1.5, scaleY: 1.5 }}
          animate={
              isAtk
              ? { scaleX: -1.5, scaleY: [1.5, 1.8, 1.5] } // ช่วงโจมตี (มีเด้ง)
              : { scaleX: -1.5, scaleY: 1.5 }             // ช่วงปกติ
          }
          // กำหนดความเร็วและความลื่นไหลของ Animation
          transition={{ duration: 0.4, ease: "easeInOut" }}

          style={{
            ...uiStyles.spriteLayer,
            backgroundImage: `url(${sprite})`,

            // ✅ การจัดวางกล่อง (เหมือนเดิม เพื่อรองรับภาพดาบที่กว้างขึ้น)
            width: isAtk ? "160%" : "100%",
            height: "100%",
            position: "absolute",
            bottom: 0,
            left: "50%",
            marginLeft: isAtk ? "-80%" : "-50%", // จัดกึ่งกลางตามความกว้าง

            // ✅ การแสดงผลภาพ
            backgroundSize: "auto 100%", // สูงเต็ม กว้างตามสัดส่วน
            backgroundPosition: "bottom center", // ยึดเท้าติดพื้น
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated", // ภาพคมชัด

            // ✅ จุดหมุนสำคัญมาก! ให้ขยายจากเท้าขึ้นไป
            transformOrigin: "bottom center",

            // ❌ ลบบรรทัด transform เดิมออก เพราะเราใช้ motion animate แทนแล้ว
            // transform: "scaleX(-1) scale(1.5)", <--- ลบอันนี้
          }}
        />
    </motion.div>
  );
};
