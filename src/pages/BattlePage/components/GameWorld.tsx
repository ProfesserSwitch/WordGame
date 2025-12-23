import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { uiStyles } from "../styles/gameStyles";
import {
  FIXED_Y,
  PLAYER_X_POS,
  DISPLAY_WIDE,
  DISPLAY_NORMAL,
  LETTER_DATA,
} from "../constants";

import type { InventoryItem, DictEntry } from "../types";

// Assets Import
import walkPlayer1 from "../../../assets/image/player/walk/1.png";
import walkPlayer2 from "../../../assets/image/player/walk/2.png";
import idlePlayer from "../../../assets/image/player/walk/1.png";
import attackPlayer1 from "../../../assets/image/player/attack/1.png";
import attackPlayer2 from "../../../assets/image/player/attack/2.png";
import walkEnemy1 from "../../../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../../../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../../../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../../../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../../../assets/image/enemy/rat/attack/2.png";
import groundImg from "../../../assets/image/tiles/grass.png";
import { HpBar } from "./HpBar";

interface GameWorldProps {
  animFrame: number;
  isPlayerAttacking: boolean;
  playerAtkFrame: number;
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number) => void;
  validWordInfo: DictEntry | null;

  inventory: (InventoryItem | null)[];
  selectedLetters: (InventoryItem | null)[];
  onSelectLetter: (item: InventoryItem, index: number) => void;
  onDeselectLetter: (index: number) => void;
  onAttack: () => void;
  onSpin: () => void;
  onResetLetters: () => void;
}

export const GameWorld: React.FC<GameWorldProps> = ({
  animFrame,
  isPlayerAttacking,
  playerAtkFrame,
  selectedTargetId,
  setSelectedTargetId,
  validWordInfo,
  inventory,
  selectedLetters,
  onSelectLetter,
  onDeselectLetter,
  onAttack,
  onSpin,
  onResetLetters,
}) => {
  const store = useGameStore();
  const gameState = useGameStore((s) => s.gameState);

  const handleAnimComplete = () => {
    store.notifyAnimationComplete();
  };

  return (
    <>
      {/* --- ส่วนแสดงผล World (ด้านบน) --- */}
      <div style={uiStyles.world}>
        {/* BACKGROUND */}
        <div
          style={{
            ...uiStyles.background,
            backgroundImage: `url(${groundImg})`,
            backgroundPositionX:
              store.gameState === "ADVANTURE"
                ? `-${store.distance * 10}px`
                : "0px",
          }}
        />

        {/* Floating Words (คำที่เลือกแล้วลอยบนฟ้า) */}
        {selectedLetters && (
          <div
            style={{
              position: "absolute",
              top: "25%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {selectedLetters.map((item, i) =>
              item && (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{
                    scale: 1.2,
                    y: -10,
                    zIndex: 100,
                    transition: { type: "spring", stiffness: 400, damping: 10 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => onDeselectLetter(i)}
                  style={{
                    background: "#f2a654",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    color: "#000",
                    width: "40px",
                    height: "40px",
                    fontSize: "20px",
                    border: "3px solid #000",
                    boxShadow: "0 6px 0 #b37400, 0 10px 10px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    position: "relative",
                  }}
                >
                  {item.char}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      right: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      opacity: 0.7,
                    }}
                  >
                    {LETTER_DATA[item.char]?.score}
                  </span>
                </motion.div>
              )
            )}
          </div>
        )}

        {/* PLAYER Entity */}
        <div
          style={{
            position: "absolute",
            width: "56px",
            height: "56px",
            transform: "translateY(-100%)",
            left: `${PLAYER_X_POS}%`,
            top: FIXED_Y,
            zIndex: 10,
          }}
        >
          <HpBar
            hp={store.playerStat.hp}
            max={store.playerStat.max_hp}
            color="#4dff8bff"
          />

          <AnimatePresence>
            {store.playerShoutText && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{
                  position: "absolute",
                  top: "-60px",
                  transform: "translateX(-50%)",
                  backgroundColor: "white",
                  color: "#333",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  border: "2px solid #000",
                  zIndex: 1000,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                {store.playerShoutText}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid #000",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {isPlayerAttacking ? (
            <motion.div
              key="player-attack"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.4 }}
              onAnimationComplete={handleAnimComplete}
              style={{
                ...uiStyles.spriteLayer,
                backgroundImage: `url(${
                  playerAtkFrame === 1 ? attackPlayer1 : attackPlayer2
                })`,
                width: DISPLAY_WIDE,
                height: DISPLAY_NORMAL,
                backgroundSize: "100% 100%",
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
                backgroundSize: "100% 100%",
              }}
            />
          )}
        </div>

        {/* ENEMIES Entities */}
        <AnimatePresence>
          {store.enemies
            .filter((e) => e.hp > 0)
            .map((en, i) => {
              const isAtk = en.atkFrame > 0;
              let sprite = isAtk
                ? en.atkFrame === 2
                  ? attackEnemy2
                  : attackEnemy1
                : store.gameState === "ADVANTURE"
                ? animFrame === 0
                  ? walkEnemy1
                  : walkEnemy2
                : idleEnemy;

              const alive = store.enemies.filter((e) => e.hp > 0);
              const currentActiveTargetId =
                selectedTargetId && alive.find((a) => a.id === selectedTargetId)
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
                    filter: isTargeted ? "drop-shadow(0 0 8px yellow)" : "none",
                    cursor: "crosshair",
                  }}
                >
                  <AnimatePresence>
                    {en.shoutText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                          position: "absolute",
                          top: "-60px",
                          transform: "translateX(-50%)",
                          backgroundColor: "white",
                          color: "#333",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          border: "2px solid #000",
                          zIndex: 1000,
                          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                        }}
                      >
                        {en.shoutText}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            borderLeft: "8px solid transparent",
                            borderRight: "8px solid transparent",
                            borderTop: "8px solid #000",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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

                  <HpBar hp={en.hp} max={en.maxHp} color="#ff4d4d" />

                  {isTargeted && <div style={uiStyles.targetArrow}>▼</div>}
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* Valid Word Meaning & Effects */}
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

      {/* --- ส่วน Panel ด้านล่าง (Inventory & Buttons) --- */}
      <div
        style={{
          ...uiStyles.panel,
          flexDirection: "column", // เรียงแนวตั้ง: Text -> Inventory -> Buttons
          alignItems: "center",
          position: "relative", // เพื่อให้ Text ใช้ Absolute ได้
        }}
      >
        {/* 1. Status Text (มุมซ้ายบนของ Panel) */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "15px",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            // textShadow: "1px 1px 0px #000",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* สถานะเกม */}
          {gameState === "PLAYERTURN" ? (
            <>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 5px #4ade80",
                }}
              />
              <span style={{ color: "#eee" }}>YOUR TURN</span>
            </>
          ) : gameState === "ACTION" ? (
            <>
              <span style={{ color: "#ffd700" }}>⏳ PROCESSING...</span>
            </>
          ) : gameState === "ENEMYTURN" ? (
            <>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ff4d4d",
                }}
              />
              <span style={{ color: "#ff4d4d" }}>ENEMY TURN</span>
            </>
          ) : gameState === "ADVANTURE" ? (
            <span style={{ color: "#4ade80" }}>EXPLORING...</span>
          ) : (
            ""
          )}
        </div>

        {/* 2. Inventory (ตรงกลาง) */}
        <div style={uiStyles.wordSection}>
          <motion.div layout style={uiStyles.inventory}>
            {inventory.map((item, index) => (
              <div
                key={`slot-${index}`}
                style={{
                  ...uiStyles.emptySlot,
                  position: "relative",
                }}
              >
                <AnimatePresence>
                  {item && (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      whileHover={{
                        scale: 1.1,
                        zIndex: 100,
                      }}
                      onClick={() => onSelectLetter(item, index)}
                      style={{
                        ...uiStyles.letterCard,
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                      {item.char}
                      <span style={uiStyles.scoreTag}>
                        {LETTER_DATA[item.char]?.score}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 3. Button Row (ด้านล่าง Inventory) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* ปุ่ม Attack อยู่กลาง (ปรับให้เด่นขึ้นนิดหน่อย) */}
          <button
            disabled={!validWordInfo || gameState !== "PLAYERTURN"}
            onClick={onAttack}
            style={{
              fontWeight: "bold",
              borderRadius: "6px",
              minWidth: "70px",
              padding: "5px 30px", 
              fontSize: "16px",
              background:
                validWordInfo && gameState === "PLAYERTURN"
                  ? "#ff4500" 
                  : "#444",
              color: "#fff",
              border: "2px solid #fff",
              boxShadow: "0 4px 0 #222",
              cursor: "pointer",
              transition: "transform 0.1s",
            }}
          >
            ATTACK
          </button>

          {/* ปุ่ม Spin อยู่ขวา */}
          {/* <button
            disabled={gameState !== "PLAYERTURN"}
            onClick={onSpin}
            style={{
              ...uiStyles.actionBtn,
              padding: "10px 20px",
              background: gameState === "PLAYERTURN" ? "#9c27b0" : "#444",
              color: "#fff",
              boxShadow: "0 4px 0 #222",
              cursor: "pointer",
            }}
          >
            SPIN
          </button> */}
        </div>
      </div>
    </>
  );
};