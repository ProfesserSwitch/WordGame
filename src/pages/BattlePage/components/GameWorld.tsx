// GameWorld.tsx

import React, { useRef, useState, useMemo } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/useGameStore";
import { uiStyles } from "../styles/gameStyles";
import { LETTER_DATA } from "../constants";
import type { InventoryItem, DictEntry, SkillData } from "../types";

// Components
import { InventorySlot } from "./InventorySlot";
import { Projectile } from "./Projectile";
import { SkillBar } from "./SkillBar"; 
import { PlayerEntity } from "./PlayerEntity";
import { EnemyEntity } from "./EnemyEntity";

// Assets
import walkEnemy1 from "../../../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../../../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../../../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../../../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../../../assets/image/enemy/rat/attack/2.png";

interface GameWorldProps {
  animFrame: number;
  isPlayerAttacking: boolean;
  playerAtkFrame: number;
  
  // ✅ Props สำหรับระบบ Targeting
  onEnemyClick: (id: number | null) => void; 
  castingSkill: SkillData | null;
  selectedTargets: number[];      

  validWordInfo: DictEntry | null;
  inventory: (InventoryItem | null)[];
  selectedLetters: (InventoryItem | null)[];
  playerInventorySize: number;

  onSelectLetter: (item: InventoryItem, index: number) => void;
  onDeselectLetter: (index: number) => void;
  onReorder: (newOrder: InventoryItem[]) => void;
  onResetLetters: () => void;

  // ✅ Generic Handler
  onSkillClick: (skill: SkillData) => void;
  onEndTurn: () => void;
  
  currentWordLength: number;
}

export const GameWorld: React.FC<GameWorldProps> = ({
  animFrame,
  isPlayerAttacking,
  playerAtkFrame,
  
  onEnemyClick,
  castingSkill,
  selectedTargets,

  validWordInfo,
  inventory,
  selectedLetters,
  playerInventorySize,

  onSelectLetter,  
  onDeselectLetter,
  onSkillClick,
  onEndTurn,
  onReorder,
  onResetLetters,
  currentWordLength,
}) => {
  const store = useGameStore();
  // Filter เอาเฉพาะช่องที่มีตัวอักษรจริงเพื่อแสดงใน Reorder Group
  const activeSelectedItems = selectedLetters.filter((item): item is InventoryItem => item !== null);
  const constraintsRef = useRef(null);

  // --- State สำหรับ Tooltip ---
  const [hoveredEnemyId, setHoveredEnemyId] = useState<number | null>(null);

  // ✅ คำนวณคะแนนรวมของคำปัจจุบัน (เพื่อเอาไปโชว์ดาเมจใน Tooltip)
  const currentWordScore = useMemo(() => {
    return activeSelectedItems.reduce((sum, item) => sum + (LETTER_DATA[item.char]?.score || 0), 0);
  }, [activeSelectedItems]);

  // ✅ Helper: คำนวณโอกาสโดน (Generic)
  const getHitChance = (enemyAC: number) => {
      if (!castingSkill) return 0;
      
      // Auto Hit
      if (castingSkill.isAutoHit) return 100;

      // Logic: D20 + Score + Bonus >= AC
      // (สมมติใช้ Score ของคำมาช่วย hit chance ด้วย หรือจะใช้ Length ตามเดิมก็ได้)
      // *แก้เป็นใช้ Word Score + Length ตามความเหมาะสมของเกมดีไซน์*
      const bonus = currentWordScore + castingSkill.hitChanceBonus; 
      const minRoll = enemyAC - bonus;
      
      if (minRoll <= 1) return 100; // roll 1 always miss? (optional) usually 1 is auto fail, but let's say min req is low
      if (minRoll > 20) return 0;   // need > 20, impossible

      const winningOutcomes = 20 - minRoll + 1;
      return Math.round((winningOutcomes / 20) * 100);
  };

  // ✅ Helper: คำนวณดาเมจ
  const getDamageInfo = () => {
      if (!castingSkill) return "0";
      
      // สูตร: Score * BasePower
      const estimatedDmg = Math.floor(currentWordScore * castingSkill.basePower) || 1;
      
      if (castingSkill.effectType === 'DAMAGE') {
          return `~${estimatedDmg}`; 
      }
      return "-";
  };

  const hoveredEnemy = store.enemies.find(e => e.id === hoveredEnemyId);

  return (
    <>
      {/* --- WORLD VIEW --- */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", borderBottom: "4px solid #000", background: "#000000ff", width: "100%" }}>
        
        {/* Background Layer */}
        <div style={{ backgroundPositionX: store.gameState === "ADVANTURE" ? `-${store.distance * 10}px` : "0px" }} />

        {/* Selected Letters (Reorder Zone) */}
        <div ref={constraintsRef} style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "320px", height: "80px", display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <Reorder.Group 
            axis="x" 
            values={activeSelectedItems} 
            onReorder={onReorder} 
            style={{ display: "flex", flexDirection: "row", gap: "8px", listStyle: "none", padding: 0, margin: 0, pointerEvents: "auto" }}
          >
            <AnimatePresence initial={false}>
              {activeSelectedItems.map((item) => {
                const originalIndex = selectedLetters.findIndex(s => s?.id === item.id);
                return (
                  <Reorder.Item 
                    key={item.id} 
                    value={item} 
                    dragConstraints={constraintsRef} 
                    dragElastic={0} 
                    dragMomentum={false} 
                    layout="position" 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0, opacity: 0 }} 
                    onTap={() => originalIndex !== -1 && onDeselectLetter(originalIndex)} 
                    style={{ background: "#f2a654", width: "44px", height: "44px", display: "flex", justifyContent: "center", alignItems: "center", border: "3px solid #000", fontWeight: "bold", fontSize: "22px", cursor: "grab", boxShadow: "0 4px 0 #b37400" }}
                  >
                    {item.char}
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {/* Player Entity */}
        <PlayerEntity store={store} isPlayerAttacking={isPlayerAttacking} playerAtkFrame={playerAtkFrame} animFrame={animFrame} onAnimationComplete={() => store.notifyAnimationComplete()} />

        {/* Enemies Layer */}
        <AnimatePresence>
          {store.enemies.filter((en) => en.hp > 0).map((en, i) => {
              const selectCount = selectedTargets.filter(id => id === en.id).length;
              
              return (
                <EnemyEntity
                  key={en.id}
                  enemy={en}
                  index={i}
                  animFrame={animFrame}
                  gameState={store.gameState}
                  isTargeted={selectCount > 0} 
                  
                  onSelect={onEnemyClick}
                  
                  // ✅ Tooltip Hooks
                  onHover={(isHover) => setHoveredEnemyId(isHover ? en.id : null)}
                  
                  selectionCount={selectCount}
                  assets={{ walkEnemy1, walkEnemy2, idleEnemy, attackEnemy1, attackEnemy2 }}
                  
                  style={{ 
                    cursor: castingSkill ? 'crosshair' : 'help', 
                    filter: (castingSkill && hoveredEnemyId === en.id) || selectCount > 0 ? 'drop-shadow(0 0 5px red)' : 'none' 
                  }}
                />
              );
          })}
        </AnimatePresence>

        {/* ✅ INTELLIGENT TOOLTIP SYSTEM */}
        <AnimatePresence>
            {hoveredEnemy && (
                <motion.div
                    key="tooltip"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'absolute',
                        left: `${hoveredEnemy.x}%`, 
                        top: '35%', 
                        transform: 'translate(-50%, -100%)',
                        background: 'rgba(0, 0, 0, 0.95)',
                        border: castingSkill ? '2px solid #ff4d4d' : '2px solid #48dbfb', 
                        borderRadius: '8px',
                        padding: '10px',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        color: '#fff',
                        textAlign: 'center',
                        minWidth: '160px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    }}
                >
                    {castingSkill ? (
                        // 🔴 MODE: TARGETING (กำลังเล็งสกิล)
                        <>
                            <div style={{ fontSize: '14px', marginBottom: '4px', color: '#ffd700', fontWeight: 'bold' }}>
                                HIT CHANCE: <span style={{ color: getHitChance(hoveredEnemy.ac) >= 50 ? '#0f0' : '#f00' }}>{getHitChance(hoveredEnemy.ac)}%</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                DMG: {getDamageInfo()}
                            </div>
                        </>
                    ) : (
                        // 🔵 MODE: INSPECT (ดูข้อมูลปกติ)
                        <>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#48dbfb', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #555', paddingBottom: '4px' }}>
                                {hoveredEnemy.name}
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '2px 5px' }}>
                                <span style={{color:'#aaa'}}>HP:</span>
                                <span style={{ color: '#ff4d4d', fontWeight:'bold' }}>{hoveredEnemy.hp}/{hoveredEnemy.maxHp}</span>
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '2px 5px' }}>
                                <span style={{color:'#aaa'}}>ATK:</span>
                                <span style={{ color: '#ff9f43', fontWeight:'bold' }}>{hoveredEnemy.atk_power_min}-{hoveredEnemy.atk_power_max}</span>
                            </div>
                            <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '2px 5px' }}>
                                <span style={{color:'#aaa'}}>AC (Def):</span>
                                <span style={{ color: '#ffd700', fontWeight:'bold' }}>{hoveredEnemy.ac}</span>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Word Meaning Popup */}
        <AnimatePresence>
          {validWordInfo && (
            <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", display: "flex", justifyContent: "center", zIndex: 999 }}>
              <div style={{ height: "65px" }} /> 
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.85, y: 0 }} exit={{ opacity: 0 }} style={{ background: "rgba(244, 228, 188)", border: "2px solid #5c4033", padding: "10px 25px", borderRadius: "4px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#8d6e63", fontWeight: "bold", textTransform: "uppercase" }}>— Meaning —<br/></span>
                <span style={{ fontSize: "16px", color: "#3e2723", fontWeight: "bold" }}>{validWordInfo.meaning}</span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Damage Popups */}
        <AnimatePresence>
          {store.damagePopups.map((p) => (
            <motion.div
              key={p.id}
              animate={{ opacity: [0, 1, 1, 0], y: p.y - 70 }}
              onAnimationComplete={() => store.removePopup(p.id)}
              style={{
                ...uiStyles.damageText,
                color: p.value === -1 ? "#bbb" : (p.isPlayer ? "#ff4d4d" : p.value === 0 ? "#00ffff" : "#ffff00"),
                left: `${p.x}%`,
              }}
            >
              {p.value === -1 ? "MISS" : (
                p.value === 0 && p.isPlayer 
                ? "BLOCK" 
                : p.isPlayer === false && p.value > 0 // Skill Shield Check
                ? `+${p.value} SHIELD`
                : p.value 
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Projectiles */}
        {store.projectiles.map(p => <Projectile key={p.id} data={p} />)}
        
        {/* Game Over Screen */}
        {store.gameState === "OVER" && (
             <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
                <h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1>
                <button onClick={() => { store.reset(); onResetLetters(); }} style={{ padding: "12px 24px", background: "#ffeb3b", border: "4px solid #000", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>RESTART</button>
             </div>
        )}
      </div>

      {/* --- BOTTOM PANEL --- */}
      <div style={{ flex: 1, justifyContent: "center", position: "relative", width: "100%", background: "#1a120b", borderTop: "4px solid #5c4033", display: "flex", flexDirection: "row", alignItems: "stretch", gap: "20px", padding: "10px", height: "280px" }}>
        
        {/* 1. Inventory (Left Side - Wide) */}
        <div id="inventory" style={{ flex: 2, maxWidth: "600px", background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)", borderRadius: "12px", border: "3px solid #eebb55", display: "flex", flexDirection: "column", alignItems: "center", padding: "8px", boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)" }}>
          <div style={{ color: "#eebb55", fontSize: "12px", fontWeight: 900, letterSpacing: "2px", borderBottom: "2px solid #eebb55", width: "95%", textAlign: "center", paddingBottom: "5px", marginBottom: "5px" }}>INVENTORY</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(4, 1fr)", padding: "10px", background: "#3e2723", border: "4px solid #d4af37", borderRadius: "5px", height: "90%", width: "95%" }}>
              {inventory.map((item, index) => (
                <InventorySlot key={`slot-${index}`} item={item ?? undefined} index={index} onSelect={onSelectLetter} isLocked={index >= playerInventorySize} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* 2. Skill Bar (Right Side) */}
        <div style={{ flex: 1, maxWidth: "300px", minWidth: "260px" }}>
          <SkillBar
            playerStat={store.playerStat}
            gameState={store.gameState}
            validWordInfo={validWordInfo}
            currentWordLength={currentWordLength}
            
            // ✅ Lock Skill Bar เมื่อกำลังเล็ง
            targetingMode={!!castingSkill} 
            
            // ✅ ส่งแค่ Generic Handlers
            onSkillClick={onSkillClick}
            onEndTurn={onEndTurn}
          />
        </div>
      </div>
    </>
  );
};