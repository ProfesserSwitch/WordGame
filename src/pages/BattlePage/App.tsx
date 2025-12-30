import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "./store/useGameStore";
import { uiStyles } from "./styles/gameStyles";
import { PLAYER_X_POS, LETTER_DATA, FIXED_Y } from "./store/constants";
import type {
  InventoryItem,
  DictEntry,
  SkillData,
  Enemy,
  Projectile,
  EnemyActionType,
  QuizData,
} from "./types";

// Components
import { InventorySlot } from "./components/InventorySlot";
import { SkillBar } from "./components/SkillBar";
import { PlayerEntity } from "./components/PlayerEntity";
import { EnemyEntity } from "./components/EnemyEntity";
import { ProjectileEntity } from "./components/ProjectileEntity";
import { MeaningPopup } from "./components/MeaningPopup";

// Assets
import walkEnemy1 from "../../assets/image/enemy/rat/walk/1.png";
import walkEnemy2 from "../../assets/image/enemy/rat/walk/2.png";
import idleEnemy from "../../assets/image/enemy/rat/walk/1.png";
import attackEnemy1 from "../../assets/image/enemy/rat/attack/1.png";
import attackEnemy2 from "../../assets/image/enemy/rat/attack/2.png";

// ==========================================
// ✅ SKILL DATABASE (แก้ไขตามที่ขอ: เพิ่ม mpCost)
// ==========================================
export const SKILL_DATABASE: SkillData[] = [
  {
    id: "o_ball",
    name: "O-BALL",
    icon: "🔥",
    description: "Deals 1-10 Dmg. (+5 MP)", // บอกผู้เล่นว่าได้ MP
    apCost: 1,
    mpCost: 0, // ✅ ไม่ใช้ MP (จะได้เพิ่ม MP แทนใน Logic)
    minWordLength: 1,
    targetType: "SINGLE",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 1,
    hitChanceBonus: 0,
    isAutoHit: false,
    projectileVisual: "FIREBALL",
    damageMin: 1,
    damageMax: 10,
    hitCount: 1,
  },
  {
    id: "shield",
    name: "SHIELD",
    icon: "🛡",
    description: "Gain Shield. (+5 MP)",
    apCost: 1,
    mpCost: 0, // ✅ ไม่ใช้ MP
    minWordLength: 1,
    targetType: "SELF",
    maxTargets: 0,
    effectType: "SHIELD",
    basePower: 1,
    hitChanceBonus: 0,
    isAutoHit: true,
    projectileVisual: "NONE",
  },
  {
    id: "v_missile",
    name: "V-MISSILE",
    icon: "🚀",
    description: "Ultimate! Hits 3 times. (25 MP)",
    apCost: 1, // หรือจะให้ 0 ก็ได้ตามดีไซน์ (ในที่นี้ใส่ 1 ไว้ก่อน)
    mpCost: 25, // ✅ ต้องใช้ 25 MP ถึงจะกดได้
    minWordLength: 0,
    targetType: "MULTI",
    maxTargets: 1,
    effectType: "DAMAGE",
    basePower: 1,
    hitChanceBonus: 100,
    isAutoHit: true,
    projectileVisual: "V_SHAPE",
    damageMin: 1,
    damageMax: 4,
    hitCount: 3,
  }
];

// ==========================================
// ✅ LOGIC UTILS (เหมือนเดิม)
// ==========================================

export const DeckManager = {
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

export const InventoryUtils = {
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

const ENEMY_PATTERNS: EnemyActionType[][] = [
  ["ATTACK", "ATTACK", "WAIT"],
  ["WAIT", "ATTACK", "ATTACK"],
  ["WAIT", "WAIT", "SKILL"],
];

export const EnemyFactory = {
  createSlime: (level: "A1", xPos: number): Enemy => {
    const randomPattern =
      ENEMY_PATTERNS[Math.floor(Math.random() * ENEMY_PATTERNS.length)];
    return {
      id: Math.random(),
      x: xPos,
      name: "Slime",
      hp: 10,
      maxHp: 10,
      ac: 8,
      atk_power_min: 2,
      atk_power_max: 3,
      level,
      atkFrame: 0,
      pattern: randomPattern,
      currentStep: 0,
    };
  },
  generateGroup: (count: number, startX: number) => {
    return Array.from({ length: count }).map((_, i) =>
      EnemyFactory.createSlime("A1", startX + i * 10)
    );
  },
};

export const CombatSystem = {
  calculateHit: (skill: SkillData, wordScore: number, targetAc: number) => {
    if (skill.isAutoHit) return true;
    const d20 = Math.floor(Math.random() * 20) + 1;
    return d20 + wordScore + skill.hitChanceBonus >= targetAc;
  },

  calculateDamage: (skill: SkillData, wordScore: number, isHit: boolean) => {
    if (!isHit) return 0;
    if (skill.damageMin !== undefined && skill.damageMax !== undefined) {
      return (
        Math.floor(Math.random() * (skill.damageMax - skill.damageMin + 1)) +
        skill.damageMin
      );
    }
    return Math.floor(wordScore * skill.basePower) || 1;
  },

  calculateWordScore: (word: string): number => {
    return word
      .toUpperCase()
      .split("")
      .reduce((total, char) => {
        const data = LETTER_DATA[char];
        const score = data ? data.score : 0;
        return total + score;
      }, 0);
  },
};

export const PhysicsEngine = {
  updateProjectiles: (projectiles: Projectile[], dt: number) => {
    return projectiles.map((p) => {
      const dx = dt * 0.09;
      const nextX = p.x + dx;
      let nextY = p.y;

      if (p.movementType === "straight") {
        nextY = p.startY || p.y;
      } else {
        nextY =
          (p.startY || p.y) + Math.sin(nextX * 0.15 + (p.phase || 0)) * 20;
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
      const targetIndex = enemies.findIndex((e) => e.id === p.targetId);
      const target = enemies[targetIndex];

      if (target && p.x >= target.x) {
        hits.push({ p, targetIndex, damage: p.isMiss ? 0 : p.damage });
      } else if (p.x < 110) {
        activeProjectiles.push(p);
      }
    });

    return { activeProjectiles, hits };
  },
};

export const WordSystem = {
  getRandomWordByLength: (dictionary: DictEntry[], length: number): string => {
    const candidates = dictionary.filter((d) => d.word.length === length);
    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      return candidates[randomIndex].word.toUpperCase();
    }
    const fallbackChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += fallbackChars.charAt(
        Math.floor(Math.random() * fallbackChars.length)
      );
    }
    return result;
  },
};

// --- QUIZ OVERLAY ---
const QuizOverlay = ({
  data,
  onAnswer,
}: {
  data: QuizData;
  onAnswer: (ans: string) => void;
}) => {
  const DURATION_MS = 10000;
  const [progress, setProgress] = useState(100);
  const savedCallback = useRef(onAnswer);

  useEffect(() => {
    savedCallback.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      const newProgress = (remaining / DURATION_MS) * 100;
      setProgress(newProgress);
      if (remaining <= 0) {
        clearInterval(timer);
        savedCallback.current("TIMEOUT");
      }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        width: "95%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "#ff4d4d",
          fontSize: "18px",
          fontWeight: "bold",
          letterSpacing: "2px",
          textShadow: "0 0 10px red",
        }}
      >
        ⚠️ ENEMY APPROACHING! TRANSLATE!
      </div>
      <div
        style={{
          width: "100%",
          height: "15px",
          background: "#333",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #fff",
        }}
      >
        <div
          style={{
            height: "100%",
            background: progress > 30 ? "#00e676" : "#ff1744",
            width: `${progress}%`,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {data.choices.map((choice, idx) => (
          <motion.button
            key={idx}
            whileHover={{
              scale: 1.05,
              background: "#444",
              border: "2px solid #ffd700",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAnswer(choice)}
            style={{
              flex: 1,
              padding: "20px 5px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "#2a2a2a",
              color: "#fff",
              border: "2px solid #555",
              borderRadius: "8px",
              cursor: "pointer",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {choice}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ... Loading/Error Views ...
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
    <h1>⚠️ ERROR</h1>
    <p>{error}</p>
    <button onClick={onRetry}>RETRY</button>
  </div>
);

// --- MAIN APP ---
export default function GameApp() {
  const store = useGameStore();
  const [appStatus, setAppStatus] = useState<"LOADING" | "READY" | "ERROR">(
    "LOADING"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const INVENTORY_COUNT = 20;
  const PLAYER_SLOTS = 10;
  const constraintsRef = useRef(null);
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

  const initGameData = async () => {
    setAppStatus("LOADING");
    setErrorMessage("");
    try {
      const response = await fetch("http://localhost:3000/dict");
      if (!response.ok)
        throw new Error(`Failed to fetch dictionary: ${response.status}`);
      const data = await response.json();
      store.setDictionary(data);
      DeckManager.init();
      setAppStatus("READY");
    } catch (err: any) {
      setErrorMessage(err.message);
      setAppStatus("ERROR");
    }
  };

  useEffect(() => {
    initGameData();
  }, []);

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
      return () => {
        cancelAnimationFrame(requestRef.current);
        clearInterval(t);
      };
    }
  }, [appStatus]);

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

  const resetCasting = () => {
    setCastingSkill(null);
    setSelectedTargets([]);
  };
  const getHitChance = (enemyAC: number) => {
    if (!castingSkill) return 0;
    if (castingSkill.isAutoHit) return 100;
    const bonus = currentWordScore + castingSkill.hitChanceBonus;
    return Math.round(((20 - (enemyAC - bonus) + 1) / 20) * 100);
  };
  const getDamageInfo = () => {
    if (!castingSkill) return "0";
    const estimatedDmg =
      Math.floor(currentWordScore * castingSkill.basePower) || 1;
    return castingSkill.effectType === "DAMAGE" ? `~${estimatedDmg}` : "-";
  };
  const handleSkillClick = (skill: SkillData) => {
    // ✅ เพิ่มการเช็ค MP ที่หน้าบ้านด้วย เพื่อความชัวร์ (ปุ่มจะกดไม่ได้อยู่แล้วเพราะ Logic ใน SkillBar แต่กันไว้)
    if (store.playerStat.mp < (skill.mpCost || 0)) return;

    if (skill.targetType === "SELF") executeSkill(skill, currentWord, []);
    else {
      const targetLimit =
        skill.maxTargets > 1 ? skill.maxTargets : skill.hitCount || 1;
      setCastingSkill({ ...skill, maxTargets: targetLimit });
      setSelectedTargets([]);
    }
  };
  const executeSkill = async (
    skill: SkillData,
    word: string,
    targets: number[]
  ) => {
    if (skill.minWordLength > 0) {
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
  const handleSpin = () => {
    if (store.playerStat.ap < 1) return;
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
    store.actionSpin(validItems);
  };
  const handleQuizAnswer = useCallback((ans: string) => {
    store.resolveQuiz(ans);
  }, []);

  if (appStatus === "LOADING") return <LoadingView />;
  if (appStatus === "ERROR")
    return <ErrorView error={errorMessage} onRetry={initGameData} />;

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
          <div
            style={{
              backgroundPositionX:
                store.gameState === "ADVANTURE"
                  ? `-${store.distance * 10}px`
                  : "0px",
            }}
          />

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
                {activeSelectedItems.map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    dragConstraints={constraintsRef}
                    layout="position"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onTap={() =>
                      handleDeselectLetter(
                        selectedLetters.findIndex((s) => s?.id === item.id)
                      )
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
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

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
              .map((en, i) => (
                <EnemyEntity
                  key={en.id}
                  enemy={en}
                  index={i}
                  animFrame={animFrame}
                  gameState={store.gameState}
                  isTargeted={selectedTargets.includes(en.id)}
                  onSelect={handleEnemyClick}
                  onHover={(isHover) =>
                    setHoveredEnemyId(isHover ? en.id : null)
                  }
                  selectionCount={
                    selectedTargets.filter((id) => id === en.id).length
                  }
                  assets={{
                    walkEnemy1,
                    walkEnemy2,
                    idleEnemy,
                    attackEnemy1,
                    attackEnemy2,
                  }}
                />
              ))}
          </AnimatePresence>

          {/* Meaning Popup */}
          <AnimatePresence>
            {validWordInfo && (
                <MeaningPopup meaning={validWordInfo.meaning} />
            )}
          </AnimatePresence>

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
          {store.gameState === "QUIZ_MODE" && store.currentQuiz ? (
            <QuizOverlay data={store.currentQuiz} onAnswer={handleQuizAnswer} />
          ) : (
            <>
              <InventorySlot 
                inventory={inventory} 
                onSelectLetter={handleSelectLetter} 
                playerSlots={10} 
              />
              <div style={{ flex: 1, maxWidth: "300px", minWidth: "260px" }}>
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
