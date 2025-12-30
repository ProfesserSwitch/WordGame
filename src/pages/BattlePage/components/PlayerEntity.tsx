import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoutBubble } from "./ShoutBubble";
import { HpBar } from "./HpBar";
import {
  DISPLAY_NORMAL,
  DISPLAY_WIDE,
  FIXED_Y,
  PLAYER_X_POS,
} from "../store/constants";
import { uiStyles } from "../styles/gameStyles";

// Assets
import walkPlayer1 from "../../../assets/image/player/walk/1.png";
import walkPlayer2 from "../../../assets/image/player/walk/2.png";
import idlePlayer from "../../../assets/image/player/walk/1.png";
import attackPlayer1 from "../../../assets/image/player/attack/1.png";
import attackPlayer2 from "../../../assets/image/player/attack/2.png";

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
  return (
    <div
      style={{
        position: "absolute",
        left: `${PLAYER_X_POS}%`,
        top: FIXED_Y,
        transform: "translateY(-100%)",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "120px",
      }}
    >
      <ShoutBubble text={store.playerShoutText} />
        <div style={{ position: "relative", width: "90%", height: "16px", marginBottom: "50px" }}>
          <HpBar
            hp={store.playerStat.hp}
            max={store.playerStat.max_hp}
            color="#4dff8b"
          />
        </div>


      {/* SPRITE & SHIELD EFFECT */}
      <div
        style={{
          position: "relative",
          width: DISPLAY_NORMAL,
          height: DISPLAY_NORMAL,
        }}
      >
        <AnimatePresence>
          {store.isShielding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "-100%",
                left: "60%",
                width: "160px",
                height: "160px",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px dashed rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  position: "absolute",
                }}
              />
              {store.shieldWords.map((char: string, i: number) => {
                const angle = (i / store.shieldWords.length) * 360;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "50%",
                      width: "40px",
                      height: "40px",
                      marginLeft: "-20px",
                      transformOrigin: "50% 80px",
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <motion.div
                      style={{
                        transform: `rotate(-${angle}deg)`,
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #aaccff 100%)",
                        color: "#003366",
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "900",
                        fontSize: "20px",
                        border: "2px solid #4d94ff",
                        boxShadow: "0 0 10px rgba(77, 148, 255, 0.8)",
                      }}
                    >
                      {char}
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {isPlayerAttacking ? (
          <motion.div
            key="player-attack"
            initial={{ scale: 1.5 }}
            animate={{ scale: [1.5, 2.0, 1.5] }}
            transition={{ duration: 0.4 }}
            onAnimationComplete={onAnimationComplete}
            style={{

              backgroundPosition: "bottom center",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated", 

              transformOrigin: "bottom center", 
              backgroundImage: `url(${
                playerAtkFrame === 1 ? attackPlayer1 : attackPlayer2
              })`,
              width: DISPLAY_WIDE,
              height: DISPLAY_NORMAL,
              backgroundSize: "auto 100%",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        ) : (
          <div
            style={{
              ...uiStyles.spriteLayer,
              backgroundImage: `url(${
                store.gameState === "ADVANTURE"
                  ? animFrame === 0
                    ? walkPlayer1
                    : walkPlayer2
                  : idlePlayer
              })`,
              width: DISPLAY_NORMAL,
              height: DISPLAY_NORMAL,
              backgroundSize: "auto 100%",
            }}
          />
        )}
      </div>
    </div>
  );
};
