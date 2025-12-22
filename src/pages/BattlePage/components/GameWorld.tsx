import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { uiStyles } from "../styles/gameStyles";
import type { DictEntry } from "../types";
import { FIXED_Y, MAX_PLAYER_HP, PLAYER_X_POS, DISPLAY_WIDE, DISPLAY_NORMAL } from "../constants";

// Assets Import (Adjust paths if needed)
import walkPlayer1 from "../../../assets/player/walk/1.png";
import walkPlayer2 from "../../../assets/player/walk/2.png";
import idlePlayer from "../../../assets/player/walk/1.png";
import attackPlayer1 from "../../../assets/player/attack/1.png";
import attackPlayer2 from "../../../assets/player/attack/2.png";
import walkEnemy1 from "../../../assets/enemy/rat/walk/1.png";
import walkEnemy2 from "../../../assets/enemy/rat/walk/2.png";
import idleEnemy from "../../../assets/enemy/rat/walk/1.png";
import attackEnemy1 from "../../../assets/enemy/rat/attack/1.png";
import attackEnemy2 from "../../../assets/enemy/rat/attack/2.png";
import groundImg from "../../../assets/tiles/grass.png";

interface GameWorldProps {
  animFrame: number;
  isPlayerAttacking: boolean;
  playerAtkFrame: number;
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number) => void;
  validWordInfo: DictEntry | null;
}

export const GameWorld: React.FC<GameWorldProps> = ({
  animFrame,
  isPlayerAttacking,
  playerAtkFrame,
  selectedTargetId,
  setSelectedTargetId,
  validWordInfo,
}) => {
  const store = useGameStore();

  return (
    <div style={uiStyles.world}>
      <div
        style={{
          ...uiStyles.background,
          backgroundImage: `url(${groundImg})`,
          backgroundPositionX:
            store.gameState === "RUN" ? `-${store.distance * 10}px` : "0px",
        }}
      />

      {/* PLAYER */}
      <div
        style={{
          ...uiStyles.entity,
          left: `${PLAYER_X_POS}%`,
          top: FIXED_Y,
          zIndex: 10,
        }}
      >
        <div style={uiStyles.hpBarBg}>
          <div
            style={{
              ...uiStyles.hpBarFill,
              width: `${(store.playerHp / MAX_PLAYER_HP) * 100}%`,
              background: "#4ade80",
            }}
          />
        </div>
        <div
          style={{
            ...uiStyles.spriteLayer,
            backgroundImage: `url(${
              isPlayerAttacking
                ? playerAtkFrame === 1
                  ? attackPlayer1
                  : attackPlayer2
                : store.gameState === "RUN"
                ? animFrame === 0
                  ? walkPlayer1
                  : walkPlayer2
                : idlePlayer
            })`,
            width: isPlayerAttacking ? DISPLAY_WIDE : DISPLAY_NORMAL,
            height: DISPLAY_NORMAL,
            backgroundSize: "100% 100%",
          }}
        />
      </div>

      <AnimatePresence>
        {store.enemies
          .filter((e) => e.hp > 0)
          .map((en, i) => {
            const isAtk = en.atkFrame > 0;
            let sprite = isAtk
              ? en.atkFrame === 2
                ? attackEnemy2
                : attackEnemy1
              : store.gameState === "RUN"
              ? animFrame === 0
                ? walkEnemy1
                : walkEnemy2
              : idleEnemy;

            const alive = store.enemies.filter((e) => e.hp > 0);
            const currentActiveTargetId = selectedTargetId && alive.find(a => a.id === selectedTargetId) 
                ? selectedTargetId 
                : alive[0]?.id;
            
            const isTargeted = currentActiveTargetId === en.id;

            return (
              <motion.div
                key={en.id}
                initial={{ left: `${en.x}%`, opacity: 1 }}
                animate={{ left: `${en.x}%` }}
                transition={{ type: "tween", duration: 0.2 }}
                exit={{
                  opacity: 0,
                  x: 100,
                  y: -150,
                  rotate: 180,
                  transition: { duration: 0.7, ease: "easeOut" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTargetId(en.id);
                }}
                style={{
                  ...uiStyles.entity,
                  top: FIXED_Y,
                  zIndex: 100 - i,
                  filter: isTargeted
                    ? "drop-shadow(0 0 8px yellow)"
                    : "none",
                  cursor: "crosshair",
                }}
              >
                {en.isCharging && (
                  <div
                    style={{
                      ...uiStyles.meaningTag,
                      bottom: "110%",
                      color: "orange",
                      border: "2px solid orange",
                    }}
                  >
                    CHARGING...
                  </div>
                )}
                <div
                  style={{
                    ...uiStyles.spriteLayer,
                    backgroundImage: `url(${sprite})`,
                    width: isAtk ? DISPLAY_WIDE : DISPLAY_NORMAL,
                    height: DISPLAY_NORMAL,
                    backgroundSize: "100% 100%",
                    transform: "scaleX(-1)",
                    marginLeft: isAtk ? `-${DISPLAY_NORMAL}px` : "0px",
                  }}
                />
                <div style={uiStyles.hpBarBg}>
                  <div
                    style={{
                      ...uiStyles.hpBarFill,
                      width: `${(en.hp / en.maxHp) * 100}%`,
                    }}
                  />
                </div>
                {isTargeted && <div style={uiStyles.targetArrow}>▼</div>}
              </motion.div>
            );
          })}
      </AnimatePresence>

      <AnimatePresence>
        {validWordInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={uiStyles.meaningTag}
          >
            {validWordInfo.meaning}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {store.damagePopups.map((p) => (
          <motion.div
            key={p.id}
            animate={{ opacity: [0, 1, 1, 0], y: p.y - 70 }}
            onAnimationComplete={() => store.removePopup(p.id)}
            style={{
              ...uiStyles.damageText,
              color: p.isPlayer
                ? "#ff4d4d"
                : p.value === 0
                ? "#00ffff"
                : "#ffff00",
              left: `${p.x}%`,
            }}
          >
            {p.value === 0 ? "CHARGE" : p.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {store.projectiles.map((p) => (
        <div
          key={p.id}
          style={{
            ...uiStyles.fireball,
            left: `${p.x}%`,
            top: p.y + 20,
            width: "18px",
            height: "18px",
          }}
        />
      ))}

      {store.gameState === "OVER" && (
        <div style={uiStyles.overlay}>
          <h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1>
          <button
            onClick={() => {
              store.reset();
              setSelectedTargetId(0);
            }}
            style={uiStyles.restartBtn}
          >
            RESTART
          </button>
        </div>
      )}
    </div>
  );
};