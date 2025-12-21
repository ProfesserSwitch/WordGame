import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem, DictEntry } from "../types";
import { LETTER_DATA } from "../constants";
import { uiStyles } from "../styles/gameStyles";
import { useGameStore } from "../store/useGameStore";

interface GameUIProps {
  inventory: InventoryItem[];
  selectedLetters: (InventoryItem | null)[];
  validWordInfo: DictEntry | null;
  onSelectLetter: (item: InventoryItem) => void;
  onDeselectLetter: (index: number) => void;
  onAttack: () => void;
  onSpin: () => void;
  onResetLetters: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  inventory,
  selectedLetters,
  validWordInfo,
  onSelectLetter,
  onDeselectLetter,
  onAttack,
  onSpin,
  onResetLetters,
}) => {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div style={uiStyles.panel}>
      <div style={uiStyles.wordSection}>
        <div style={uiStyles.actionRow}>
          <div
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              minWidth: "120px",
            }}
          >
            {gameState === "BATTLE_PLAYER"
              ? "🟢 YOUR TURN"
              : gameState === "ACTION"
              ? "⏳ PROCESSING..."
              : "🔴 ENEMY TURN"}
          </div>
          <div style={uiStyles.slotContainer}>
            {selectedLetters.map((item, i) => (
              <div
                key={i}
                style={uiStyles.slot}
                onClick={() => onDeselectLetter(i)}
              >
                <AnimatePresence>
                  {item && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={uiStyles.letterCard}
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
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={
                !validWordInfo || gameState !== "BATTLE_PLAYER"
              }
              onClick={onAttack}
              style={{
                ...uiStyles.actionBtn,
                background:
                  validWordInfo && gameState === "BATTLE_PLAYER"
                    ? "#ff4500"
                    : "#444",
                color: "#fff",
              }}
            >
              ATTACK
            </button>

            <button
              disabled={gameState !== "BATTLE_PLAYER"}
              onClick={onSpin}
              style={{
                ...uiStyles.actionBtn,
                background: gameState === "BATTLE_PLAYER" ? "#9c27b0" : "#444",
                color: "#fff",
              }}
            >
              SPIN
            </button>

            <button
              onClick={onResetLetters}
              style={{
                ...uiStyles.actionBtn,
                background: "#ff4d4d",
                color: "#fff",
              }}
            >
              RESET
            </button>
          </div>
        </div>

        <motion.div layout style={uiStyles.inventory}>
          <AnimatePresence>
            {inventory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => onSelectLetter(item)}
                style={uiStyles.letterCard}
              >
                {item.char}
                <span style={uiStyles.scoreTag}>
                  {LETTER_DATA[item.char]?.score}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};