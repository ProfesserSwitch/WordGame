import React, { useEffect, useState, useRef, useMemo } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "./store/useGameStore";
import { uiStyles } from "./styles/gameStyles";
import { PLAYER_X_POS, LETTER_DATA, FIXED_Y  } from "./constants";
import type { InventoryItem, DictEntry, SkillData, Enemy, Projectile } from "./types";

// Components
import { InventorySlot } from "./components/InventorySlot";
import { SkillBar } from "./components/SkillBar";
import { PlayerEntity } from "./components/PlayerEntity";
import { EnemyEntity } from "./components/EnemyEntity";
import { ProjectileEntity } from "./components/ProjectileEntity";

// Assets
import walkEnemy1 from "../../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../../assets/image/enemy/rat/attack/2.png";

// --- ✅ LOGIC UTILS (Pure Functions) ---

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
    return {
      id: Math.random(),
      char: this.getRandomChar(),
      visible: true,
      originalIndex: index,
    };
  },
  generateList(count: number, startIndex = 0): InventoryItem[] {
    return Array.from({ length: count }).map((_, i) =>
      this.createItem(startIndex + i)
    );
  },
};

const InventoryUtils = {
  fillEmptySlots: (
    currentInv: (InventoryItem | null)[],
    reservedIndices: number[],
    limit: number,
    forceReplace = false
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
  returnItems: (
    currentInv: (InventoryItem | null)[],
    itemsToReturn: InventoryItem[],
    limit: number
  ) => {
    const nextInv = [...currentInv];
    itemsToReturn.forEach((item) => {
      let targetIdx = item.originalIndex;
      if (nextInv[targetIdx] !== null) {
        const emptyIdx = nextInv.findIndex((x, i) => x === null && i < limit);
        if (emptyIdx !== -1) targetIdx = emptyIdx;
      }
      nextInv[targetIdx] = item;
    });
    return nextInv;
  },
};

// ✅ 1. Enemy Factory: สร้างศัตรู
export const EnemyFactory = {
  createSlime: (level: "A1", xPos: number): Enemy => ({
    id: Math.random(),
    x: xPos,
    name: "Slime",
    hp: 10,
    maxHp: 10,
    ac: 8,
    atk_power_min: 2,
    atk_power_max: 3,
    cooldown: 2,
    current_cooldown: 0,
    level,
    atkFrame: 0,
  }),
  generateGroup: (count: number, startX: number) => {
    return Array.from({ length: count }).map((_, i) => 
      EnemyFactory.createSlime("A1", startX + (i * 10))
    );
  }
};

// ✅ 2. Combat System: คำนวณดาเมจและโอกาสตีโดน
export const CombatSystem = {
  calculateHit: (skill: SkillData, wordScore: number, targetAc: number) => {
    if (skill.isAutoHit) return true;
    const d20 = Math.floor(Math.random() * 20) + 1;
    // WordScore อาจจะยังบวก Hit Chance อยู่ตามดีไซน์เดิม
    return (d20 + wordScore + skill.hitChanceBonus) >= targetAc;
  },
  
  // ✅ แก้ไข: รองรับ Random Range
  calculateDamage: (skill: SkillData, wordScore: number, isHit: boolean) => {
    if (!isHit) return 0;

    // กรณี 1: มีการระบุ Range (เช่น 1-10)
    if (skill.damageMin !== undefined && skill.damageMax !== undefined) {
        return Math.floor(Math.random() * (skill.damageMax - skill.damageMin + 1)) + skill.damageMin;
    }

    // กรณี 2: แบบเดิม (Score * Multiplier)
    return Math.floor(wordScore * skill.basePower) || 1;
  },

  calculateWordScore: (word: string): number => {
    return word
      .toUpperCase() // แปลงเป็นตัวพิมพ์ใหญ่ให้ตรงกับ Key ใน LETTER_DATA
      .split("")
      .reduce((total, char) => {
        // ดึงข้อมูลของตัวอักษรนั้นๆ ออกมา
        const data = LETTER_DATA[char];
        
        // ถ้ามีข้อมูล ให้บวก .score เข้าไป, ถ้าไม่มี (กัน Bug) ให้บวก 0
        const score = data ? data.score : 0;
        
        return total + score;
      }, 0);
  },
};

// ✅ 3. Physics Engine: คำนวณการเคลื่อนที่และการชน
export const PhysicsEngine = {
  updateProjectiles: (projectiles: Projectile[], dt: number) => {
    return projectiles.map((p) => {
      const dx = dt * 0.09;
      const nextX = p.x + dx;
      let nextY = p.y;

      if (p.movementType === 'straight') {
        nextY = p.startY || p.y;
      } else {
        // Wavy movement logic
        nextY = (p.startY || p.y) + Math.sin(nextX * 0.15 + (p.phase || 0)) * 20;
      }

      const deltaY = nextY - p.y;
      const deltaX = nextX - p.x;
      const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      return { ...p, x: nextX, y: nextY, rotation };
    });
  },

  checkCollisions: (projectiles: Projectile[], enemies: Enemy[]) => {
    const hits: { p: Projectile; targetIndex: number; damage: number }[] = [];
    const activeProjectiles: Projectile[] = [];

    projectiles.forEach((p) => {
      const targetIndex = enemies.findIndex(e => e.id === p.targetId);
      const target = enemies[targetIndex];

      // Check Collision condition (Hit target OR out of bounds)
      if (target && p.x >= target.x) {
        hits.push({ p, targetIndex, damage: p.isMiss ? 0 : p.damage });
      } else if (p.x < 110) { // Still flying
        activeProjectiles.push(p);
      }
    });

    return { activeProjectiles, hits };
  }
};

// ✅ 4. Word System: จัดการเรื่องคำศัพท์
export const WordSystem = {
  getRandomWordByLength: (dictionary: DictEntry[], length: number): string => {
    // กรองคำที่มีความยาวตรงกับดาเมจ
    const candidates = dictionary.filter(d => d.word.length === length);
    
    // ถ้ามีคำ ให้สุ่มมา 1 คำ
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    
    // Fallback: ถ้าไม่มีคำยาวเท่านี้ใน dict ให้สร้างเสียงคำรามมั่วๆ เช่น ดาเมจ 3 -> "AAA"
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += fallbackChars.charAt(Math.floor(Math.random() * fallbackChars.length));
    }
    return result;
  }
};

// --- ✅ LOADING SCREEN COMPONENTS ---

const LoadingView = () => {
  // State สำหรับสลับเฟรมเดิน (Animation Frame)
  const [frame, setFrame] = useState(0);

  // Loop สลับรูปทุกๆ 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#121212",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#eebb55",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* พื้นหลังจางๆ (Optional) */}
      <div
        style={{
          position: "absolute",
          bottom: "40%",
          width: "100%",
          height: "2px",
          background: "#333",
        }}
      ></div>

      {/* ตัวละครเดิน */}
      <div style={{ position: "relative", marginBottom: "30px" }}>
        {/* เงาใต้เท้า */}
        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            left: "10%",
            width: "80%",
            height: "10px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }}
        />

        {/* รูปตัวละคร (ใช้ Framer Motion ให้เด้งนิดๆ ตอนเดิน) */}
        <motion.img
          key={frame} // บังคับ Re-render เมื่อเปลี่ยนเฟรม
          src={frame === 0 ? walkEnemy1 : walkEnemy2} // 👈 เปลี่ยนเป็นรูป Player ของคุณตรงนี้
          alt="Loading..."
          style={{
            width: "64px",
            height: "64px",
            imageRendering: "pixelated", // ให้ภาพคมแบบ Pixel Art
            position: "relative",
            zIndex: 2,
          }}
          animate={{ y: [0, -4, 0] }} // เด้งขึ้นลง
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Text Loading */}
      <h2
        style={{
          fontFamily: "monospace",
          letterSpacing: "4px",
          fontSize: "24px",
          textShadow: "0 0 10px rgba(238, 187, 85, 0.5)",
        }}
      >
        LOADING...
      </h2>
      <p
        style={{
          color: "#666",
          fontSize: "12px",
          marginTop: "5px",
          fontFamily: "monospace",
        }}
      >
        Preparing Battle Assets
      </p>
    </div>
  );
};

const ErrorView = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div
    style={{
      width: "100vw",
      height: "100vh",
      background: "#1a0505",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "#ff4d4d",
    }}
  >
    <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️ ERROR</h1>
    <p
      style={{
        color: "#fff",
        marginBottom: "30px",
        textAlign: "center",
        maxWidth: "400px",
      }}
    >
      {error}
      <br />
      <span style={{ fontSize: "12px", color: "#aaa" }}>
        (Server might be offline)
      </span>
    </p>
    <button
      onClick={onRetry}
      style={{
        padding: "12px 30px",
        fontSize: "18px",
        fontWeight: "bold",
        background: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 0 15px rgba(255, 77, 77, 0.4)",
      }}
    >
      RETRY CONNECTION
    </button>
  </div>
);

// --- ✅ MAIN COMPONENT ---

export default function GameApp() {
  const store = useGameStore();

  // --- App State (Loading System) ---
  const [appStatus, setAppStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // --- Game Config ---
  const INVENTORY_COUNT = 20;
  const PLAYER_SLOTS = 10;
  const constraintsRef = useRef(null);

  // --- Game State ---
  const [castingSkill, setCastingSkill] = useState<SkillData | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [inventory, setInventory] = useState<(InventoryItem | null)[]>(
    new Array(INVENTORY_COUNT).fill(null)
  );
  const [selectedLetters, setSelectedLetters] = useState<
    (InventoryItem | null)[]
  >(new Array(10).fill(null));

  const [animFrame, setAnimFrame] = useState(0);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);
  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);
  const [hoveredEnemyId, setHoveredEnemyId] = useState<number | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- Derived State ---
  const activeSelectedItems = selectedLetters.filter(
    (item): item is InventoryItem => item !== null
  );
  const currentWord = activeSelectedItems
    .map((l) => l.char)
    .join("")
    .toLowerCase();

  const currentWordScore = useMemo(() => {
    return activeSelectedItems.reduce(
      (sum, item) => sum + (LETTER_DATA[item.char]?.score || 0),
      0
    );
  }, [activeSelectedItems]);

  const hoveredEnemy = store.enemies.find((e) => e.id === hoveredEnemyId);

  // --- ✅ Initialization (Load Data) ---
  const initGameData = async () => {
    setAppStatus("LOADING");
    setErrorMessage("");

    try {
      // 1. Load Dictionary (Critical)
      const response = await fetch("http://localhost:3000/dict");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dictionary: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Dictionary data is empty or invalid format.");
      }

      store.setDictionary(data);

      // 2. Init Deck Logic
      DeckManager.init();

      // 3. (Optional) Preload Images here if needed

      // Success -> Start Game
      setAppStatus("READY");
    } catch (err: any) {
      console.error("Game Init Error:", err);
      setErrorMessage(err.message || "Unknown Network Error");
      setAppStatus("ERROR");
    }
  };

  // เรียก Init ครั้งแรกเมื่อเข้าเว็บ
  useEffect(() => {
    initGameData();
  }, []);

  // --- Game Loop (Only active when READY) ---
  const animate = (time: number) => {
    if (appStatus !== "READY") return; // ห้ามรันถ้ายังโหลดไม่เสร็จ

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
      return () => {
        cancelAnimationFrame(requestRef.current);
        clearInterval(t);
      };
    }
  }, [appStatus]);

  // --- Sync Logic ---
  useEffect(() => {
    store.setInventory(
      inventory.filter((item): item is InventoryItem => item !== null)
    );
  }, [inventory]);

  useEffect(() => {
    if (store.gameState === "PREPARING_COMBAT") {
      const initialLoot = DeckManager.generateList(10);
      const nextInv = new Array(INVENTORY_COUNT).fill(null);
      initialLoot.forEach((item, i) => (nextInv[i] = item));
      setInventory(nextInv);
      store.spawnEnemies(initialLoot);
    }
  }, [store.gameState]);

  useEffect(() => {
    if (store.gameState === "PLAYERTURN") {
      setInventory((prev) => {
        const reserved = selectedLetters
          .filter((l): l is InventoryItem => l !== null)
          .map((l) => l.originalIndex);
        return InventoryUtils.fillEmptySlots(prev, reserved, PLAYER_SLOTS);
      });
    }
  }, [store.gameState]);

  useEffect(() => {
    if (!currentWord) {
      setValidWordInfo(null);
      resetCasting();
      return;
    }
    const found = store.dictionary.find(
      (d) => d.word.toLowerCase() === currentWord
    );
    setValidWordInfo(found || null);
    if (!found) resetCasting();
  }, [currentWord, store.dictionary]);

  // --- Helpers & Handlers ---
  const resetCasting = () => {
    setCastingSkill(null);
    setSelectedTargets([]);
  };

  // แสดงผลการคำนวณ Hit Chance / Damage
  const getHitChance = (enemyAC: number) => {
    if (!castingSkill) return 0;
    if (castingSkill.isAutoHit) return 100;
    const bonus = currentWordScore + castingSkill.hitChanceBonus;
    const minRoll = enemyAC - bonus;
    if (minRoll <= 1) return 100;
    if (minRoll > 20) return 0;
    return Math.round(((20 - minRoll + 1) / 20) * 100);
  };
  const getDamageInfo = () => {
    if (!castingSkill) return "0";
    const estimatedDmg =
      Math.floor(currentWordScore * castingSkill.basePower) || 1;
    return castingSkill.effectType === "DAMAGE" ? `~${estimatedDmg}` : "-";
  };

  // กด 1 สกิล
  const handleSkillClick = (skill: SkillData) => {
    if (skill.effectType === "SPIN") {
      const reserved = selectedLetters
        .filter((l): l is InventoryItem => l !== null)
        .map((l) => l.originalIndex);
      const newInv = InventoryUtils.fillEmptySlots(
        inventory,
        reserved,
        PLAYER_SLOTS,
        true
      );
      setInventory(newInv);
      const validItems = newInv.filter(
        (item): item is InventoryItem => item !== null
      );
      store.castSkill(skill, "", [], validItems);
    } else if (skill.targetType === "SELF") {
      executeSkill(skill, currentWord, []);
    } else {
      // ✅ แก้ตรงนี้: คำนวณจำนวนเป้าหมายที่จะให้เลือก
      // ถ้า skill ไม่ได้ระบุ maxTargets มา ให้ใช้ hitCount (จำนวนนัด) แทน
      // เช่น V-Missile ยิง 3 นัด ก็ต้องเลือกเป้าได้ 3 ครั้ง
      const targetLimit =
        skill.maxTargets > 1 ? skill.maxTargets : skill.hitCount || 1;

      // setCastingSkill โดยยัด maxTargets ที่ถูกต้องเข้าไป
      setCastingSkill({ ...skill, maxTargets: targetLimit });
      setSelectedTargets([]);
    }
  };

  
  const executeSkill = async (
    skill: SkillData,
    word: string,
    targets: number[]
  ) => {
    if (skill.effectType !== "SPIN" && skill.minWordLength > 0) {
      const nextInv = [...inventory];
      selectedLetters.forEach((item) => {
        if (item) nextInv[item.originalIndex] = null;
      });
      setInventory(nextInv);
    }
    setSelectedLetters(new Array(10).fill(null));
    setValidWordInfo(null);
    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    setTimeout(() => setPlayerAtkFrame(2), 400);
    setTimeout(() => {
      setIsPlayerAttacking(false);
      setPlayerAtkFrame(0);
    }, 1000);
    await store.castSkill(skill, word, targets);
  };

  const handleEnemyClick = async (id: number | null) => {
    if (!castingSkill || id === null) return;
    const newTargets = [...selectedTargets, id];
    newTargets.length >= castingSkill.maxTargets
      ? await executeSkill(castingSkill, currentWord, newTargets).then(
          resetCasting
        )
      : setSelectedTargets(newTargets);
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
      setInventory((prev) =>
        InventoryUtils.returnItems(prev, [item], PLAYER_SLOTS)
      );
      const newSelected = [...selectedLetters];
      newSelected[idx] = null;
      const remaining = newSelected.filter((l) => l !== null);
      setSelectedLetters([
        ...remaining,
        ...new Array(10 - remaining.length).fill(null),
      ]);
    }
  };

  const handleResetLetters = () => {
    const items = selectedLetters.filter((l): l is InventoryItem => l !== null);
    if (items.length === 0) return;
    setInventory((prev) =>
      InventoryUtils.returnItems(prev, items, PLAYER_SLOTS)
    );
    setSelectedLetters(new Array(10).fill(null));
  };

  const handleEndTurn = () => {
    handleResetLetters();
    store.runEnemyTurn();
  };

  // --- ✅ MAIN RENDER: SWITCH VIEW BASED ON STATUS ---

  if (appStatus === "LOADING") {
    return <LoadingView />;
  }

  if (appStatus === "ERROR") {
    return <ErrorView error={errorMessage} onRetry={initGameData} />;
  }

  // READY STATE: RENDER GAME
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#121212",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "95vh",
          aspectRatio: "10/6",
          width: "auto",
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          border: "4px solid #000",
          background: "#B3F1FF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* --- Targeting Header --- */}
        {castingSkill && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 0,
              width: "100%",
              textAlign: "center",
              zIndex: 999,
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,0.85)",
                color: "#ff9f43",
                padding: "8px 16px",
                borderRadius: 20,
                border: "2px solid #fff",
                fontWeight: "bold",
              }}
            >
              {castingSkill.name}: SELECT TARGET {selectedTargets.length + 1} /{" "}
              {castingSkill.maxTargets}
            </span>
            <button
              onClick={resetCasting}
              style={{
                marginLeft: 10,
                padding: "5px 10px",
                borderRadius: "10px",
                background: "#fff",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </div>
        )}

        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            borderBottom: "4px solid #000",
            background: "#000000ff",
            width: "100%",
          }}
        >
          {/* Background */}
          <div
            style={{
              backgroundPositionX:
                store.gameState === "ADVANTURE"
                  ? `-${store.distance * 10}px`
                  : "0px",
            }}
          />

          {/* Reorder Group */}
          <div
            ref={constraintsRef}
            style={{
              position: "absolute",
              top: "25%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              width: "320px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Reorder.Group
              axis="x"
              values={activeSelectedItems}
              onReorder={(newOrder) =>
                setSelectedLetters([
                  ...newOrder,
                  ...new Array(10 - newOrder.length).fill(null),
                ])
              }
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                listStyle: "none",
                padding: 0,
                margin: 0,
                pointerEvents: "auto",
              }}
            >
              <AnimatePresence initial={false}>
                {activeSelectedItems.map((item) => {
                  const originalIndex = selectedLetters.findIndex(
                    (s) => s?.id === item.id
                  );
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
                      onTap={() =>
                        originalIndex !== -1 &&
                        handleDeselectLetter(originalIndex)
                      }
                      style={{
                        background: "#f2a654",
                        width: "44px",
                        height: "44px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "3px solid #000",
                        fontWeight: "bold",
                        fontSize: "22px",
                        cursor: "grab",
                        boxShadow: "0 4px 0 #b37400",
                      }}
                    >
                      {item.char}
                    </Reorder.Item>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          {/* Entities */}
          <PlayerEntity
            store={store}
            isPlayerAttacking={isPlayerAttacking}
            playerAtkFrame={playerAtkFrame}
            animFrame={animFrame}
            onAnimationComplete={() => store.notifyAnimationComplete()}
          />

          <AnimatePresence>
            {store.enemies
              .filter((en) => en.hp > 0)
              .map((en, i) => {
                const selectCount = selectedTargets.filter(
                  (id) => id === en.id
                ).length;
                return (
                  <EnemyEntity
                    key={en.id}
                    enemy={en}
                    index={i}
                    animFrame={animFrame}
                    gameState={store.gameState}
                    isTargeted={selectCount > 0}
                    onSelect={handleEnemyClick}
                    onHover={(isHover) =>
                      setHoveredEnemyId(isHover ? en.id : null)
                    }
                    selectionCount={selectCount}
                    assets={{
                      walkEnemy1,
                      walkEnemy2,
                      idleEnemy,
                      attackEnemy1,
                      attackEnemy2,
                    }}
                    style={{
                      cursor: castingSkill ? "crosshair" : "help",
                      filter:
                        (castingSkill && hoveredEnemyId === en.id) ||
                        selectCount > 0
                          ? "drop-shadow(0 0 5px red)"
                          : "none",
                    }}
                  />
                );
              })}
          </AnimatePresence>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredEnemy && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: `${hoveredEnemy.x}%`,
                  top: "35%",
                  transform: "translate(-50%, -100%)",
                  background: "rgba(0, 0, 0, 0.95)",
                  border: castingSkill
                    ? "2px solid #ff4d4d"
                    : "2px solid #48dbfb",
                  borderRadius: "8px",
                  padding: "10px",
                  zIndex: 9999,
                  pointerEvents: "none",
                  color: "#fff",
                  textAlign: "center",
                  minWidth: "160px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                }}
              >
                {castingSkill ? (
                  <>
                    <div
                      style={{
                        fontSize: "14px",
                        marginBottom: "4px",
                        color: "#ffd700",
                        fontWeight: "bold",
                      }}
                    >
                      HIT CHANCE:{" "}
                      <span
                        style={{
                          color:
                            getHitChance(hoveredEnemy.ac) >= 50
                              ? "#0f0"
                              : "#f00",
                        }}
                      >
                        {getHitChance(hoveredEnemy.ac)}%
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                      DMG: {getDamageInfo()}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#48dbfb",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                        borderBottom: "1px solid #555",
                        paddingBottom: "4px",
                      }}
                    >
                      {hoveredEnemy.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 5px",
                      }}
                    >
                      <span style={{ color: "#aaa" }}>HP:</span>
                      <span style={{ color: "#ff4d4d", fontWeight: "bold" }}>
                        {hoveredEnemy.hp}/{hoveredEnemy.maxHp}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 5px",
                      }}
                    >
                      <span style={{ color: "#aaa" }}>ATK:</span>
                      <span style={{ color: "#ff9f43", fontWeight: "bold" }}>
                        {hoveredEnemy.atk_power_min}-
                        {hoveredEnemy.atk_power_max}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 5px",
                      }}
                    >
                      <span style={{ color: "#aaa" }}>AC:</span>
                      <span style={{ color: "#ffd700", fontWeight: "bold" }}>
                        {hoveredEnemy.ac}
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meaning Popup */}
          <AnimatePresence>
            {validWordInfo && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 999,
                }}
              >
                <div style={{ height: "65px" }} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "rgba(244, 228, 188)",
                    border: "2px solid #5c4033",
                    padding: "10px 25px",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#8d6e63",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    — Meaning —<br />
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#3e2723",
                      fontWeight: "bold",
                    }}
                  >
                    {validWordInfo.meaning}
                  </span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Damage Popups & Projectiles */}
          <AnimatePresence>
            {store.damagePopups.map((p) => (
              <motion.div
                key={p.id}
                animate={{ opacity: [0, 1, 1, 0], y: p.y - 70 }}
                onAnimationComplete={() => store.removePopup(p.id)}
                style={{
                  ...uiStyles.damageText,
                  color:
                    p.value === -1
                      ? "#bbb"
                      : p.isPlayer
                      ? "#ff4d4d"
                      : p.value === 0
                      ? "#00ffff"
                      : "#ffff00",
                  left: `${p.x}%`,
                }}
              >
                {p.value === -1
                  ? "MISS"
                  : p.value === 0 && p.isPlayer
                  ? "BLOCK"
                  : p.isPlayer === false && p.value > 0
                  ? `+${p.value} SHIELD`
                  : p.value}
              </motion.div>
            ))}
          </AnimatePresence>
          {store.projectiles.map((p) => (
            <ProjectileEntity key={p.id} data={p} />
          ))}

          {/* Game Over */}
          {store.gameState === "OVER" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 100,
              }}
            >
              <h1 style={{ color: "#ff4d4d" }}>GAME OVER</h1>
              <button
                onClick={() => {
                  store.reset();
                  handleResetLetters();
                }}
                style={{
                  padding: "12px 24px",
                  background: "#ffeb3b",
                  border: "4px solid #000",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                RESTART
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            justifyContent: "center",
            position: "relative",
            width: "100%",
            background: "#1a120b",
            borderTop: "4px solid #5c4033",
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: "20px",
            padding: "10px",
            height: "280px",
          }}
        >
          <div
            id="inventory"
            style={{
              flex: 2,
              maxWidth: "600px",
              background: "linear-gradient(180deg, #3d2b1f 0%, #2e2019 100%)",
              borderRadius: "12px",
              border: "3px solid #eebb55",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                color: "#eebb55",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "2px",
                borderBottom: "2px solid #eebb55",
                width: "95%",
                textAlign: "center",
                paddingBottom: "5px",
                marginBottom: "5px",
              }}
            >
              INVENTORY
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <motion.div
                layout
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gridTemplateRows: "repeat(4, 1fr)",
                  padding: "10px",
                  background: "#3e2723",
                  border: "4px solid #d4af37",
                  borderRadius: "5px",
                  height: "90%",
                  width: "95%",
                }}
              >
                {inventory.map((item, index) => (
                  <InventorySlot
                    key={`slot-${index}`}
                    item={item ?? undefined}
                    index={index}
                    onSelect={handleSelectLetter}
                    isLocked={index >= PLAYER_SLOTS}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: "300px", minWidth: "260px" }}>
            <SkillBar
              playerStat={store.playerStat}
              gameState={store.gameState}
              validWordInfo={validWordInfo}
              currentWordLength={activeSelectedItems.length}
              targetingMode={!!castingSkill}
              onSkillClick={handleSkillClick}
              onEndTurn={handleEndTurn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
