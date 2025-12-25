import { useEffect, useState, useRef, useMemo } from "react";
import { useGameStore } from "./store/useGameStore";
import { GameWorld } from "./components/GameWorld";
import { LETTER_DATA } from "./constants";
import type { InventoryItem, DictEntry, SkillData } from "./types";

// ✅ 1. Deck Manager: จัดการเรื่องการสุ่มตัวอักษรไว้ที่เดียว (Reuse ได้ตลอด)
const DeckManager = {
  deck: [] as string[],
  init() {
    this.deck = [];
    Object.keys(LETTER_DATA).forEach((char) => {
      for (let i = 0; i < LETTER_DATA[char].count; i++) this.deck.push(char);
    });
  },
  getRandomChar() {
    if (this.deck.length === 0) this.init();
    return this.deck[Math.floor(Math.random() * this.deck.length)];
  },
  createItem(index: number): InventoryItem {
    return { id: Math.random(), char: this.getRandomChar(), visible: true, originalIndex: index };
  },
  generateList(count: number, startIndex = 0): InventoryItem[] {
    return Array.from({ length: count }).map((_, i) => this.createItem(startIndex + i));
  }
};

// ✅ 2. Inventory Utils: รวม Logic การจัดการ Array ของ Inventory
const InventoryUtils = {
  // เติมของลงในช่องว่าง (ใช้สำหรับทั้ง Start Turn และ Skill Spin)
  fillEmptySlots: (
    currentInv: (InventoryItem | null)[], 
    reservedIndices: number[], 
    limit: number,
    forceReplace = false // Option: บังคับทับของเดิม (สำหรับ Spin)
  ) => {
    const nextInv = [...currentInv];
    for (let i = 0; i < limit; i++) {
      const isReserved = reservedIndices.includes(i);
      const isEmpty = nextInv[i] === null;
      
      if (!isReserved && (isEmpty || forceReplace)) {
        nextInv[i] = DeckManager.createItem(i);
      }
    }
    return nextInv;
  },

  // คืนของกลับเข้า Inventory (Reset / Deselect)
  returnItems: (
    currentInv: (InventoryItem | null)[], 
    itemsToReturn: InventoryItem[],
    limit: number
  ) => {
    const nextInv = [...currentInv];
    itemsToReturn.forEach(item => {
      // พยายามคืนที่เดิม ถ้าไม่ได้ให้หาช่องว่างแรก
      let targetIdx = item.originalIndex;
      if (nextInv[targetIdx] !== null) {
        const emptyIdx = nextInv.findIndex((x, i) => x === null && i < limit);
        if (emptyIdx !== -1) targetIdx = emptyIdx;
      }
      nextInv[targetIdx] = item;
    });
    return nextInv;
  }
};

export default function GameApp() {
  const store = useGameStore();
  const INVENTORY_COUNT = 20;
  const PLAYER_SLOTS = 10;

  // --- State ---
  const [castingSkill, setCastingSkill] = useState<SkillData | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [inventory, setInventory] = useState<(InventoryItem | null)[]>(new Array(INVENTORY_COUNT).fill(null));
  const [selectedLetters, setSelectedLetters] = useState<(InventoryItem | null)[]>(new Array(10).fill(null));
  
  // Animation State
  const [animFrame, setAnimFrame] = useState(0);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);
  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- Init ---
  useEffect(() => {
    fetch("http://localhost:3000/dict").then((res) => res.json()).then(store.setDictionary).catch(() => {});
    DeckManager.init(); // เตรียม Deck ครั้งเดียว
  }, []);

  // --- Game Loop & Animation ---
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const dt = time - lastTimeRef.current;
      if (dt < 100) store.update(dt);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    const t = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 250);
    return () => { cancelAnimationFrame(requestRef.current); clearInterval(t); };
  }, []);

  // --- Sync & Game Logic ---
  
  // 1. One-Way Sync UI -> Store
  useEffect(() => {
     store.setInventory(inventory.filter((item): item is InventoryItem => item !== null));
  }, [inventory]);

  // 2. Spawn Enemies -> Init Loot
  useEffect(() => {
    if (store.gameState === "PREPARING_COMBAT") {
        const initialLoot = DeckManager.generateList(10);
        const nextInv = new Array(INVENTORY_COUNT).fill(null);
        initialLoot.forEach((item, i) => nextInv[i] = item);
        
        setInventory(nextInv);
        store.spawnEnemies(initialLoot);
    }
  }, [store.gameState]);

  // 3. Start Turn -> Refill Inventory
  useEffect(() => {
    if (store.gameState === "PLAYERTURN") {
      setInventory(prev => {
        const reserved = selectedLetters.filter((l): l is InventoryItem => l !== null).map(l => l.originalIndex);
        return InventoryUtils.fillEmptySlots(prev, reserved, PLAYER_SLOTS);
      });
    }
  }, [store.gameState]);

  // 4. Word Check
  const currentWord = selectedLetters.filter((l) => l !== null).map((l) => l?.char).join("").toLowerCase();
  useEffect(() => {
    if (!currentWord) { setValidWordInfo(null); resetCasting(); return; }
    const found = store.dictionary.find((d) => d.word.toLowerCase() === currentWord);
    setValidWordInfo(found || null);
    if (!found) resetCasting();
  }, [currentWord, store.dictionary]);

  // --- Handlers ---

  const resetCasting = () => { setCastingSkill(null); setSelectedTargets([]); };

  const handleSkillClick = (skill: SkillData) => {
    if (skill.effectType === 'SPIN') {
        // Reuse Logic: ใช้ fillEmptySlots แต่เปิดโหมด forceReplace
        const reserved = selectedLetters.filter((l): l is InventoryItem => l !== null).map(l => l.originalIndex);
        const newInv = InventoryUtils.fillEmptySlots(inventory, reserved, PLAYER_SLOTS, true);
        
        setInventory(newInv);
        const validItems = newInv.filter((item): item is InventoryItem => item !== null);
        store.castSkill(skill, "", [], validItems);
    } 
    else if (skill.targetType === 'SELF') {
        executeSkill(skill, currentWord, []); 
    } 
    else {
        setCastingSkill(skill);
        setSelectedTargets([]);
    }
  };

  const executeSkill = async (skill: SkillData, word: string, targets: number[]) => {
    // 1. Remove used letters (Set to null)
    if (skill.effectType !== 'SPIN' && skill.minWordLength > 0) {
        const nextInv = [...inventory];
        selectedLetters.forEach(item => { if(item) nextInv[item.originalIndex] = null; });
        setInventory(nextInv);
    }

    // 2. Reset UI & Animate
    setSelectedLetters(new Array(10).fill(null));
    setValidWordInfo(null);
    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    
    // Animation Sequence
    setTimeout(() => setPlayerAtkFrame(2), 400);
    setTimeout(() => { setIsPlayerAttacking(false); setPlayerAtkFrame(0); }, 1000);
    
    await store.castSkill(skill, word, targets);
  };

  const handleEnemyClick = async (id: number | null) => {
    if (!castingSkill || id === null) return;
    const newTargets = [...selectedTargets, id];
    (newTargets.length >= castingSkill.maxTargets) 
        ? await executeSkill(castingSkill, currentWord, newTargets).then(resetCasting)
        : setSelectedTargets(newTargets);
  };

  // --- Inventory Interactions (Simplified) ---

  const handleSelectLetter = (item: InventoryItem, idx: number) => {
    if (store.gameState !== "PLAYERTURN") return;
    const emptyIdx = selectedLetters.findIndex(s => s === null);
    if (emptyIdx !== -1) {
       const newSelected = [...selectedLetters]; newSelected[emptyIdx] = item;
       setSelectedLetters(newSelected);
       
       const newInv = [...inventory]; newInv[idx] = null;
       setInventory(newInv);
    }
  };

  const handleDeselectLetter = (idx: number) => {
    const item = selectedLetters[idx];
    if (item && store.gameState === "PLAYERTURN") {
      // Reuse Logic: ใช้ returnItems Helper
      setInventory(prev => InventoryUtils.returnItems(prev, [item], PLAYER_SLOTS));
      
      const newSelected = [...selectedLetters]; newSelected[idx] = null;
      // Re-pack array (optional) or keep hole
      const remaining = newSelected.filter(l => l !== null);
      setSelectedLetters([...remaining, ...new Array(10 - remaining.length).fill(null)]);
    }
  };
  const handleResetLetters = () => {
    const items = selectedLetters.filter((l): l is InventoryItem => l !== null);
    if (items.length === 0) return;
    
    setInventory(prev => InventoryUtils.returnItems(prev, items, PLAYER_SLOTS));
    setSelectedLetters(new Array(10).fill(null));
  };

  const handleEndTurn = () => { handleResetLetters(); store.runEnemyTurn(); };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#121212", overflow: "hidden" }}>
      <div style={{ height: "95vh", aspectRatio: "10/6", width: "auto", maxWidth: "100vw", display: "flex", flexDirection: "column", border: "4px solid #000", background: "#B3F1FF", position: "relative", overflow: "hidden", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
        
        {castingSkill && (
          <div style={{ position: 'absolute', top: 10, left: 0, width: '100%', textAlign: 'center', zIndex: 999 }}>
            <span style={{ background: 'rgba(0,0,0,0.85)', color: '#ff9f43', padding: '8px 16px', borderRadius: 20, border: '2px solid #fff', fontWeight: 'bold' }}>
              {castingSkill.name}: SELECT TARGET {selectedTargets.length + 1} / {castingSkill.maxTargets}
            </span>
            <button onClick={resetCasting} style={{ marginLeft: 10, padding: "5px 10px", borderRadius: "10px", background: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}>CANCEL</button>
          </div>
        )}

        <GameWorld
          animFrame={animFrame}
          isPlayerAttacking={isPlayerAttacking}
          playerAtkFrame={playerAtkFrame}
          
          onEnemyClick={handleEnemyClick}
          castingSkill={castingSkill}
          selectedTargets={selectedTargets}
          validWordInfo={validWordInfo}
          
          inventory={inventory}
          selectedLetters={selectedLetters}
          playerInventorySize={PLAYER_SLOTS}
          currentWordLength={selectedLetters.filter(x=>x).length}

          onReorder={(newOrder) => setSelectedLetters([...newOrder, ...new Array(10 - newOrder.length).fill(null)])}
          onSelectLetter={handleSelectLetter}
          onDeselectLetter={handleDeselectLetter}
          onSkillClick={handleSkillClick}
          onEndTurn={handleEndTurn}
          onResetLetters={handleResetLetters}
        />
      </div>
    </div>
  );
}