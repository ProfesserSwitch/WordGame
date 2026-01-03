import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";

// Store
import { useGameStore } from "./store/useGameStore";
import { LETTER_DATA, PLAYER_SLOTS, INVENTORY_COUNT } from "./store/constants";
import type { InventoryItem, DictEntry, SkillData, GameState } from "./types";

// Utils
import { DeckManager, InventoryUtils } from "./utils/gameSystems";
import { ENEMY_ASSETS } from "./config/assetManifest";

// Components
import { InventorySlot } from "./components/InventorySlot";
import { SkillBar } from "./components/SkillBar";
import { PlayerEntity } from "./components/PlayerEntity";
import { EnemyEntity } from "./components/EnemyEntity";
import { ProjectileEntity } from "./components/ProjectileEntity";
import { MeaningPopup } from "./components/MeaningPopup";
import { QuizOverlay } from "./components/QuizOverlay";
import LoadingView from "./components/LoadingView";
import ErrorView from "./components/ErrorView";
import { Tooltip } from "./components/Tooltip";
import { BattleLog, type LogEntry } from "./components/BattleLog";

const TOTAL_WAVES = 3;

export default function GameApp() {
  const store = useGameStore();

  const [appStatus, setAppStatus] = useState<"LOADING" | "READY" | "ERROR">("LOADING");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [castingSkill, setCastingSkill] = useState<SkillData | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);
  
  // Inventory
  const [inventory, setInventory] = useState<(InventoryItem | null)[]>(new Array(INVENTORY_COUNT).fill(null));
  const [selectedLetters, setSelectedLetters] = useState<(InventoryItem | null)[]>(new Array(PLAYER_SLOTS).fill(null));
  
  const [animFrame, setAnimFrame] = useState(0);
  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);
  const [hoveredEnemyId, setHoveredEnemyId] = useState<number | null>(null);
  
  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const previousGameState = useRef<GameState>(store.gameState);
  const constraintsRef = useRef(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Computed
  const activeSelectedItems = useMemo(() => selectedLetters.filter((item): item is InventoryItem => item !== null), [selectedLetters]);
  const currentWord = useMemo(() => activeSelectedItems.map((l) => l.char).join("").toLowerCase(), [activeSelectedItems]);
  const hoveredEnemy = store.enemies.find((e) => e.id === hoveredEnemyId);

  // --- LOGIC: LOGGING SYSTEM ---
const addLog = (message: string, type: LogEntry["type"] = "info", combatData?: LogEntry["combat"]) => {
    setLogs((prev) => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type,
            timestamp: Date.now(),
            combat: combatData // ใส่ข้อมูล Combat ลงไปใน State
        };
        const newLogs = [...prev, newLog];
        if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
        return newLogs;
    });
  };

  // Log Game State Changes
  useEffect(() => {
     if (store.gameState === "ADVANTURE") addLog("ออกเดินทางสำรวจ...", "info");
     if (store.gameState === "PREPARING_COMBAT") addLog(`⚠️ พบศัตรู! (Wave ${store.currentWave})`, "danger");
     if (store.gameState === "WAVE_CLEARED") addLog("🎉 กำจัดศัตรูทั้งหมดในเวฟนี้สำเร็จ!", "success");
     if (store.gameState === "GAME_CLEARED") addLog("🏆 ภารกิจเสร็จสิ้น! เคลียร์ดันเจี้ยนสำเร็จ", "special");
     if (store.gameState === "OVER") addLog("💀 พ่ายแพ้...", "danger");
  }, [store.gameState, store.currentWave]);

  // Log HP Loss
  const prevHp = useRef(store.playerStat.hp);
  useEffect(() => {
      if (store.playerStat.hp < prevHp.current) {
          const dmg = prevHp.current - store.playerStat.hp;
          addLog(`โดนโจมตี! เสีย HP -${dmg}`, "danger");
      }
      prevHp.current = store.playerStat.hp;
  }, [store.playerStat.hp]);

  // --- INIT ---
  const initGameData = async () => {
    setAppStatus("LOADING");
    try {
      await store.initializeGame();
      setAppStatus("READY");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load game data");
      setAppStatus("ERROR");
    }
  };

  useEffect(() => { initGameData(); }, []);

  // Game Loop
  const animate = (time: number) => {
    if (appStatus !== "READY") return;
    if (lastTimeRef.current !== undefined) {
      const dt = time - lastTimeRef.current;
      if (dt < 100) store.update(dt);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (appStatus === "READY") {
      requestRef.current = requestAnimationFrame(animate);
      const t = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 250);
      return () => { cancelAnimationFrame(requestRef.current); clearInterval(t); };
    }
  }, [appStatus]);

  useEffect(() => { store.setInventory(inventory); }, [inventory]);

  // Inventory Refill Logic
  useEffect(() => {
    const activeSlots = store.playerStat.unlockedSlots; 
    if (store.gameState === "PREPARING_COMBAT") {
      const timer = setTimeout(() => {
          const initialLoot = DeckManager.generateList(activeSlots);
          const nextInv = new Array(INVENTORY_COUNT).fill(null);
          initialLoot.forEach((item, i) => { if (i < INVENTORY_COUNT) nextInv[i] = item; });
          setInventory(nextInv);
          store.spawnEnemies(nextInv);
      }, 2000); 
      return () => clearTimeout(timer);
    } 
    else if (store.gameState === "PLAYERTURN" && previousGameState.current === "ENEMYTURN") {
      setInventory(store.inventory);
    }
    previousGameState.current = store.gameState;
  }, [store.gameState, store.inventory, store.playerStat.unlockedSlots]);

  // Word Check
  useEffect(() => {
    if (!currentWord) { setValidWordInfo(null); resetCasting(); return; }
    const found = store.dictionary.find((d) => d.word.toLowerCase() === currentWord);
    setValidWordInfo(found || null);
    if (!found) resetCasting();
  }, [currentWord, store.dictionary]);

  // Handlers
  const resetCasting = () => { setCastingSkill(null); setSelectedTargets([]); };

  // Calculate Damage for Tooltip
  const getDamageInfo = () => {
    if (!castingSkill) return { text: "0", value: 0, isWeak: false };

    const isBasic = (castingSkill.mpCost || 0) === 0;
    
    if (castingSkill.effectType === "DAMAGE") {
      if (isBasic) {
        let weightedScore = 0;
        let hasWeakness = false;
        if (hoveredEnemy && hoveredEnemy.weakness_list) {
            const lowerWord = currentWord.toLowerCase();
            for (const char of lowerWord) {
                const weakData = hoveredEnemy.weakness_list.find((w: any) => w.alphabet.toLowerCase() === char);
                if (weakData) {
                    weightedScore += weakData.multiplier;
                    hasWeakness = true;
                } else { weightedScore += 1; }
            }
        } else { weightedScore = currentWord.length; }

        const power = castingSkill.basePower || 1;
        const finalDmg = parseFloat((weightedScore * power).toFixed(1));
        return { text: `${finalDmg}`, value: finalDmg, isWeak: hasWeakness };
      } else {
        return { text: `${castingSkill.damageMin}`, value: castingSkill.damageMin || 0, isWeak: false }; 
      }
    } 
    
    if (castingSkill.effectType === "SHIELD") {
      if (isBasic) {
        const power = castingSkill.basePower || 1;
        const shieldVal = currentWord.length * power;
        return { text: `+${shieldVal}`, value: shieldVal, isWeak: false };
      } else {
        return { text: `+${castingSkill.basePower}`, value: castingSkill.basePower, isWeak: false };
      }
    }
    return { text: "-", value: 0, isWeak: false };
  };

  const handleSkillClick = (skill: SkillData) => {
    if (store.playerStat.mp < (skill.mpCost || 0)) return;
    if (skill.targetType === "SELF") executeSkill(skill, currentWord, []);
    else { setCastingSkill({ ...skill, maxTargets: skill.maxTargets }); setSelectedTargets([]); }
  };

const executeSkill = async (skill: SkillData, word: string, targets: number[]) => {
    if (skill.minWordLength > 0) {
      const nextInv = [...inventory];
      selectedLetters.forEach((item) => { if (item) nextInv[item.originalIndex] = null; });
      setInventory(nextInv);
    }

    // --- แก้ไข LOGIC การ LOG ตรงนี้ ---
    if (skill.effectType === "DAMAGE") {
        // 1. หาชื่อเป้าหมาย
        let targetName = "ศัตรู";
        if (targets.length === 1) {
            // หาชื่อจาก ID (สมมติว่า EnemyEntity มี field name หรือใช้ type เอา)
            const targetEnt = store.enemies.find(e => e.id === targets[0]);
            if (targetEnt) targetName = `Monster ${targetEnt.id}`; // หรือ targetEnt.name ถ้ามี
        } else if (targets.length > 1) {
            targetName = `กลุ่มศัตรู (${targets.length} ตัว)`;
        }

        // 2. คำนวณดาเมจเพื่อเอามาโชว์ (ใช้ฟังก์ชัน getDamageInfo ที่มีอยู่แล้ว)
        // หมายเหตุ: getDamageInfo คำนวณจาก hoveredEnemy ถ้าไม่ได้เอาเมาส์ชี้ตอนกด อาจจะเพี้ยนได้
        // แต่เบื้องต้นใช้ตัวนี้ไปก่อนเพื่อให้ UI ขึ้นเลขครับ
        const dmgInfo = getDamageInfo(); 

        // 3. ส่งข้อมูลแบบ Combat เข้าไป
        addLog("", "combat", {
            attacker: "Player",      // หรือ store.playerStat.name
            target: targetName,
            skill: skill.name,
            damage: dmgInfo.value    // เอาตัวเลขดาเมจมาใส่
        });

    } else if (skill.effectType === "SHIELD") {
        addLog(`🛡️ ร่ายเกราะ "${skill.name}" ด้วยคำว่า "${word}"`, "success");
    }
    // ----------------------------------

    setSelectedLetters(new Array(PLAYER_SLOTS).fill(null));
    setValidWordInfo(null);
    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    setTimeout(() => setPlayerAtkFrame(2), 400);
    setTimeout(() => { setIsPlayerAttacking(false); setPlayerAtkFrame(0); }, 1000);

    await store.castSkill(skill, word, targets);
    resetCasting();
  };

  const handleEnemyClick = async (id: number | null) => {
    if (!castingSkill || id === null) return;
    const newTargets = [...selectedTargets, id];
    if (newTargets.length >= castingSkill.maxTargets) await executeSkill(castingSkill, currentWord, newTargets);
    else setSelectedTargets(newTargets);
  };

  const handleSelectLetter = (item: InventoryItem, idx: number) => {
    if (store.gameState !== "PLAYERTURN") return;
    const emptyIdx = selectedLetters.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      const newSelected = [...selectedLetters];
      newSelected[emptyIdx] = item;
      setSelectedLetters(newSelected);
      const newInv = [...inventory];
      newInv[idx] = null;
      setInventory(newInv);
    }
  };

  const handleDeselectLetter = (idx: number) => {
    const item = selectedLetters[idx];
    if (item && store.gameState === "PLAYERTURN") {
      setInventory((prev) => InventoryUtils.returnItems(prev, [item], PLAYER_SLOTS));
      const newSelected = [...selectedLetters];
      newSelected[idx] = null;
      const remaining = newSelected.filter((l) => l !== null);
      setSelectedLetters([...remaining, ...new Array(PLAYER_SLOTS - remaining.length).fill(null)]);
    }
  };

  const handleResetLetters = () => {
    const items = activeSelectedItems;
    if (items.length === 0) return;
    setInventory((prev) => InventoryUtils.returnItems(prev, items, PLAYER_SLOTS));
    setSelectedLetters(new Array(PLAYER_SLOTS).fill(null));
  };

  const handleEndTurn = () => { handleResetLetters(); store.runEnemyTurn(); };

  const handleSpin = () => {
    if (store.playerStat.rp < 1) { addLog("RP ไม่พอ!", "info"); return; }
    
    addLog("🎲 Reroll ตัวอักษรใหม่", "info");
    
    const nextInv = inventory.map((item, index) => {
      if (item === null) return null;
      if (index >= store.playerStat.unlockedSlots) return null;
      return DeckManager.createItem(index);
    });
    setInventory(nextInv);
    store.actionSpin(nextInv);
  };

  const handleQuizAnswer = useCallback((ans: string) => { store.resolveQuiz(ans); }, [store]);

  // --- RENDER ---
  if (appStatus === "LOADING") return <LoadingView progress={store.loadingProgress} />;
  if (appStatus === "ERROR") return <ErrorView error={errorMessage} onRetry={initGameData} />;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#121212", overflow: "hidden" }}>
      <div style={{ height: "95vh", aspectRatio: "10/6", width: "auto", maxWidth: "100vw", display: "flex", flexDirection: "column", border: "4px solid #000", background: "#B3F1FF", position: "relative", overflow: "hidden", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
        
        {/* Overlay: Select Target */}
        {castingSkill && (
          <div style={{ position: "absolute", top: 10, left: 0, width: "100%", textAlign: "center", zIndex: 999 }}>
            <span style={{ background: "rgba(0,0,0,0.85)", color: "#ff9f43", padding: "8px 16px", borderRadius: 20, border: "2px solid #fff", fontWeight: "bold" }}>
              {castingSkill.name}: SELECT TARGET {selectedTargets.length + 1} / {castingSkill.maxTargets}
            </span>
            <button onClick={resetCasting} style={{ marginLeft: 10, padding: "5px 10px", borderRadius: "10px", background: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}>CANCEL</button>
          </div>
        )}

        {/* --- GAME VIEW CONTAINER --- */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", borderBottom: "4px solid #000", background: "#000000ff", width: "100%" }}>
          {/* Background */}
          <div style={{ width: "100%", height: "100%", backgroundPositionX: store.gameState === "ADVANTURE" ? `-${store.distance * 10}px` : "0px" }} />

          {/* Letters Drag Area */}
          <div ref={constraintsRef} style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", zIndex: 100, width: "320px", height: "80px", display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
            <Reorder.Group axis="x" values={activeSelectedItems} onReorder={(newOrder) => setSelectedLetters([...newOrder, ...new Array(10 - newOrder.length).fill(null)])} style={{ display: "flex", flexDirection: "row", gap: "8px", listStyle: "none", padding: 0, margin: 0, pointerEvents: "auto" }}>
              <AnimatePresence initial={false}>
                {activeSelectedItems.map((item) => (
                  <Reorder.Item key={item.id} value={item} dragConstraints={constraintsRef} layout="position" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} onTap={() => handleDeselectLetter(selectedLetters.findIndex((s) => s?.id === item.id))} style={{ background: "#f2a654", width: "44px", height: "44px", display: "flex", justifyContent: "center", alignItems: "center", border: "3px solid #000", fontWeight: "bold", fontSize: "22px", cursor: "grab", boxShadow: "0 4px 0 #b37400" }}>
                    {item.char}
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          <PlayerEntity store={store} isPlayerAttacking={isPlayerAttacking} playerAtkFrame={playerAtkFrame} animFrame={animFrame} onAnimationComplete={() => store.notifyAnimationComplete()} />

          <AnimatePresence>
            {store.enemies.filter((en) => en.hp > 0).map((en, i) => (
                <EnemyEntity key={en.id} enemy={en} index={i} animFrame={animFrame} gameState={store.gameState} isTargeted={selectedTargets.includes(en.id)} onSelect={handleEnemyClick} onHover={(isHover) => setHoveredEnemyId(isHover ? en.id : null)} selectionCount={selectedTargets.filter((id) => id === en.id).length} assets={ENEMY_ASSETS} />
            ))}
          </AnimatePresence>

          {store.projectiles.map((p) => (<ProjectileEntity key={p.id} data={p} />))}
          <AnimatePresence>{validWordInfo && (<MeaningPopup meaning={validWordInfo.meaning} />)}</AnimatePresence>
          
          {/* ✅ Tooltip ใหม่ */}
          <Tooltip hoveredEnemy={hoveredEnemy} castingSkill={castingSkill} damageInfo={getDamageInfo()} />

          {store.gameState === "OVER" && (<div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 100 }}><h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1><button onClick={() => { store.reset(); handleResetLetters(); }} style={{ padding: "12px 24px", background: "#ffeb3b", border: "4px solid #000", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>RESTART</button></div>)}
          {store.gameState === "WAVE_CLEARED" && (<div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, pointerEvents: 'none' }}><h1 style={{ color: "#00b894", fontSize: '4rem', textShadow: '4px 4px 0 #000' }}>WAVE CLEARED!</h1></div>)}
          {store.gameState === "GAME_CLEARED" && (<div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 999, background: "rgba(0,0,0,0.85)" }}><h1 style={{ color: "#00b894", fontSize: '4rem', textShadow: '4px 4px 0 #000' }}>STAGE CLEARED!</h1><button onClick={() => { store.reset(); handleResetLetters(); }} style={{ padding: "12px 24px", background: "#00b894", border: "4px solid #fff", color: "#fff", fontWeight: "bold", cursor: "pointer", marginTop: "20px", fontSize: "1.5rem" }}>PLAY AGAIN</button></div>)}
        </div>

{/* --- BOTTOM UI (COMPACT VERSION) --- */}
<div style={{ 
    flex: 1, 
    justifyContent: "center", 
    position: "relative", 
    width: "100%", 
    background: "#1a120b", 
    borderTop: "4px solid #5c4033", 
    display: "flex", 
    flexDirection: "row", 
    alignItems: "stretch", 
    gap: "8px",             // ลด Gap 15px -> 8px
    padding: "8px",         // ลด Padding 15px -> 8px
    height: "210px"         // ลด Height 280px -> 210px (ช่วยเรื่องจอไม่พอ)
}}>
  {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
    <QuizOverlay data={store.currentQuiz} onAnswer={handleQuizAnswer} onTimeout={() => store.resolveQuiz("TIMEOUT")} />
  ) : (
    <>
       {/* 1. Battle Log: ลด minWidth เพื่อไม่ให้ดันเพื่อน */}
       <div style={{ flex: 1, maxWidth: "250px", minWidth: "180px" }}>
          <BattleLog logs={logs} />
       </div>

       {/* 2. Inventory: ลด maxWidth เพื่อแก้ปัญหา "กว้างไป" */}
       {/* ปรับ flex ลงเล็กน้อยเพื่อให้เหลือที่ให้ SkillBar */}
       <div style={{ flex: 1.5, maxWidth: "450px", minWidth: "300px" }}> 
          <InventorySlot inventory={inventory} onSelectLetter={handleSelectLetter} playerSlots={store.playerStat.unlockedSlots} />
       </div>

       {/* 3. Skill Bar: อันเดิม (แต่จะสั้นลงตาม Parent) */}
       <div style={{ flex: 1, maxWidth: "300px", minWidth: "240px" }}>
          <SkillBar 
            playerStat={store.playerStat} 
            gameState={store.gameState} 
            validWordInfo={validWordInfo} 
            currentWordLength={activeSelectedItems.length} 
            targetingMode={!!castingSkill} 
            onSkillClick={handleSkillClick} 
            onSpin={handleSpin} 
            onEndTurn={handleEndTurn} 
          />
       </div>
    </>
  )}
</div>
      </div>
    </div>
  );
}