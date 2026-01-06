import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DISPLAY_NORMAL,
  DISPLAY_WIDE,
  FIXED_Y,
  PLAYER_X_POS,
} from "../store/constants";
import { PLAYER_ASSETS } from "../config/assetManifest";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";

interface PlayerEntityProps {
  store: any;
  isPlayerAttacking: boolean;
  playerAtkFrame: number;
  animFrame: number;
  onAnimationComplete: () => void;
}

export const PlayerEntity: React.FC<PlayerEntityProps> = ({
  store,
  isPlayerAttacking,
  playerAtkFrame,
  animFrame,
  onAnimationComplete,
}) => {
  // เช็คโหมดเกม: ถ้าเป็น ADVENTURE คือเดิน (Walk), ถ้าไม่ใช่คือสู้ (Idle)
  const isAdventure = store.gameState === "ADVANTURE";

  return (
    <div
      style={{
        position: "absolute",
        left: `${PLAYER_X_POS}%`,
        top: FIXED_Y,
        transform: "translateY(-100%)", // ดึงขึ้นเพื่อให้จุด anchor อยู่ที่เท้า
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* --- DODGE MOTION WRAPPER --- */}
      <motion.div
        animate={{ x: store.isDodging ? -50 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* --- 1. SHOUT BUBBLE --- */}
        <div style={{ zIndex: 20, marginBottom: "10px", height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoutBubble text={store.playerShoutText} />
        </div>

        {/* --- 2. HUD (HP Bar & Shield) --- */}
        <div style={{ position: "relative", width: "100px", height: "16px", marginBottom: "35px", zIndex: 15, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <HpBar hp={store.playerStat.hp} max={store.playerStat.max_hp} color="#4dff8b" />

          {/* Shield Badge */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              right: "10px",
              top: "-20px",
              padding: "0 6px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              zIndex: 20,
              minWidth: "24px",
            }}
          >
            <span style={{ fontSize: "12px", color: store.playerStat.shield > 0 ? "#00bcd4" : "#888", fontWeight: 'bold', lineHeight: 1 }}>🛡</span>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff", textShadow: "1px 1px 0 #000", lineHeight: 1 }}>
              {store.playerStat.shield}
            </span>
          </motion.div>
        </div>

        {/* --- 3. CHARACTER & EFFECTS --- */}
        <div style={{ position: "relative", width: DISPLAY_NORMAL, height: DISPLAY_NORMAL }}>

          {/* Shield Visual Effect */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}>
            <AnimatePresence>
              {store.isShielding && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{ width: "140px", height: "140px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", marginTop: "-70px", marginLeft: "-70px" }}
                >
                  <div style={{ width: "100%", height: "100%", border: "2px dashed rgba(255,255,255,0.5)", borderRadius: "50%", position: "absolute", boxShadow: "0 0 15px rgba(77, 148, 255, 0.3)" }} />
                  {store.shieldWords && store.shieldWords.map((char: string, i: number) => {
                    const angle = (i / store.shieldWords.length) * 360;
                    return (
                      <div key={i} style={{ position: "absolute", top: 0, left: "50%", width: "30px", height: "30px", marginLeft: "-15px", transformOrigin: "50% 70px", transform: `rotate(${angle}deg)` }}>
                        <motion.div style={{ transform: `rotate(-${angle}deg)`, background: "linear-gradient(135deg, #fff 0%, #aaccff 100%)", color: "#003366", width: "100%", height: "100%", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", border: "1px solid #4d94ff", boxShadow: "0 0 5px rgba(77, 148, 255, 0.8)" }}>{char}</motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sprite Rendering */}
          <div style={{ position: "relative", zIndex: 5, width: "100%", height: "100%" }}>
            {isPlayerAttacking ? (
              // ⚔️ ATTACK STATE
              <motion.div
                key="atk"
                initial={{ scale: 1.5 }}
                animate={{ scale: [1.5, 2.0, 1.5] }}
                transition={{ duration: 0.4 }}
                onAnimationComplete={onAnimationComplete}
                // ใช้ style ของ Framer Motion (x) แทน transform ใน style เพื่อความแม่นยำ
                style={{
                  x: "-50%", // จัดกึ่งกลางแนวนอน
                  left: "50%",
                  bottom: 0,
                  position: "absolute",
                  width: DISPLAY_WIDE,
                  height: DISPLAY_NORMAL,
                  backgroundImage: `url(${playerAtkFrame === 1 ? PLAYER_ASSETS.attackPlayer1 : PLAYER_ASSETS.attackPlayer2})`,
                  backgroundSize: "auto 100%",
                  backgroundRepeat: "no-repeat",
                  imageRendering: "pixelated",

                  // 🔥 FIX 1: ให้จุดขยายตัว (Scale) เริ่มจากเท้า เพื่อไม่ให้เท้าลอย
                  transformOrigin: "bottom center",
                  
                  // 🔥 FIX 2: ปรับตำแหน่งพื้นของท่าโจมตี (แก้เลข 0px ถ้าท่าตีเท้าลอย)
                  backgroundPosition: "center bottom 0px", 
                }}
              />
            ) : (
              // 🚶 IDLE / WALK STATE
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${isAdventure ? (animFrame === 0 ? PLAYER_ASSETS.walkPlayer1 : PLAYER_ASSETS.walkPlayer2) : PLAYER_ASSETS.idlePlayer})`,
                  backgroundSize: "auto 100%",
                  backgroundRepeat: "no-repeat",
                  imageRendering: "pixelated",
                  transform: "scale(1.5)",
                  
                  // 🔥 FIX 3: ให้จุดขยายตัวเริ่มจากเท้าเหมือนกัน
                  transformOrigin: "bottom center",

                  // 🔥 FIX 4: แยกตำแหน่ง Y ของท่าเดิน (Adventure) กับท่ายืนสู้ (Idle)
                  // ถ้าท่าไหนลอยกว่าอีกท่า ให้ลองปรับตัวเลข px (เช่น -2px, 2px)
                  backgroundPosition: isAdventure 
                    ? "center bottom 0px"  // ตำแหน่งตอนเดิน
                    : "center bottom 0px", // ตำแหน่งตอนยืนสู้ (ลองแก้ตรงนี้ถ้าไม่เท่ากัน)
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};