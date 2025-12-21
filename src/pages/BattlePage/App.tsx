import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { create } from "zustand";

// --- Assets Path ---
import walkPlayer1 from "../../assets/player/walk/1.png";
import walkPlayer2 from "../../assets/player/walk/2.png";
import idlePlayer from "../../assets/player/walk/1.png";
import attackPlayer1 from "../../assets/player/attack/1.png";
import attackPlayer2 from "../../assets/player/attack/2.png";
import walkEnemy1 from "../../assets/enemy/rat/walk/1.png";
import walkEnemy2 from "../../assets/enemy/rat/walk/2.png";
import idleEnemy from "../../assets/enemy/rat/walk/1.png";
import attackEnemy1 from "../../assets/enemy/rat/attack/1.png";
import attackEnemy2 from "../../assets/enemy/rat/attack/2.png";
import groundImg from "../../assets/tiles/grass.png";

// --- Types & Constants ---
type Enemy = {
  id: number;
  hp: number;
  maxHp: number;
  atk: number;
  x: number;
  targetX: number;
  isAttacking: boolean;
  atkFrame: number;
  isCharging: boolean;
};
type Projectile = {
  id: number;
  x: number;
  y: number;
  damage: number;
  targetId: number;
};
type InventoryItem = {
  char: string;
  id: number;
  visible: boolean;
};
type DamagePopup = {
  id: number;
  x: number;
  y: number;
  value: number;
  isPlayer?: boolean;
};
type DictEntry = { word: string; type: string; meaning: string };

const MAX_PLAYER_HP = 100;
const FIXED_Y = 200;
const PLAYER_X_POS = 10;
const DISPLAY_NORMAL = 16 * 3.5;
const DISPLAY_WIDE = 32 * 3.5;

const LETTER_DATA: { [key: string]: { count: number; score: number } } = {
  A: { count: 9, score: 1 },
  E: { count: 12, score: 1 },
  I: { count: 9, score: 1 },
  O: { count: 8, score: 1 },
  U: { count: 4, score: 1 },
  L: { count: 4, score: 1 },
  N: { count: 6, score: 1 },
  R: { count: 6, score: 1 },
  S: { count: 4, score: 1 },
  T: { count: 6, score: 1 },
  D: { count: 4, score: 1 },
  G: { count: 3, score: 1 },
  B: { count: 2, score: 1 },
  C: { count: 2, score: 1 },
  M: { count: 2, score: 1 },
  P: { count: 2, score: 1 },
  F: { count: 2, score: 1 },
  H: { count: 2, score: 1 },
  V: { count: 2, score: 2 },
  W: { count: 2, score: 1 },
  Y: { count: 2, score: 1 },
  K: { count: 1, score: 1 },
  J: { count: 1, score: 2 },
  X: { count: 1, score: 3 },
  Q: { count: 1, score: 3 },
  Z: { count: 1, score: 3 },
};

// --- Game Store ---
interface GameStateStore {
  gameState: "RUN" | "BATTLE_PLAYER" | "BATTLE_ENEMY" | "ACTION" | "OVER";
  playerHp: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  distance: number;
  damagePopups: DamagePopup[];
  update: (dt: number) => void;
  damagePlayer: (dmg: number) => void;
  spawnEnemies: () => void;
  fireProjectile: (p: Projectile) => void;
  reset: () => void;
  addPopup: (p: DamagePopup) => void;
  removePopup: (id: number) => void;
  endPlayerTurn: (dmg: number, targetId: number) => Promise<void>;
}

const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: "RUN",
  playerHp: MAX_PLAYER_HP,
  enemies: [],
  projectiles: [],
  distance: 0,
  damagePopups: [],

  addPopup: (p) => set((s) => ({ damagePopups: [...s.damagePopups, p] })),
  removePopup: (id) =>
    set((s) => ({ damagePopups: s.damagePopups.filter((p) => p.id !== id) })),

  damagePlayer: (dmg) => {
    set((s) => ({ playerHp: Math.max(0, s.playerHp - dmg) }));
    get().addPopup({
      id: Math.random(),
      x: PLAYER_X_POS + 2,
      y: FIXED_Y - 70,
      value: dmg,
      isPlayer: true,
    });
    if (get().playerHp <= 0) set({ gameState: "OVER" });
  },

  spawnEnemies: () =>
    set({
      gameState: "BATTLE_PLAYER",
      enemies: [
        {
          id: Math.random(),
          hp: 20,
          maxHp: 20,
          atk: 10,
          x: 75,
          targetX: 75,
          isAttacking: false,
          atkFrame: 0,
          isCharging: false,
        },
        {
          id: Math.random(),
          hp: 100,
          maxHp: 100,
          atk: 10,
          x: 88,
          targetX: 88,
          isAttacking: false,
          atkFrame: 0,
          isCharging: false,
        },
      ],
    }),

  fireProjectile: (p) => set((s) => ({ projectiles: [...s.projectiles, p] })),

  endPlayerTurn: async (dmg, targetId) => {
    set({ gameState: "ACTION" });

    // 1. รออนิเมชั่นตัวละครโจมตี 1 -> 2
    await new Promise((r) => setTimeout(r, 450));

    // 2. ปล่อยลูกไฟ
    const target = get().enemies.find((e) => e.id === targetId);
    if (target && target.hp > 0) {
      get().fireProjectile({
        id: Math.random(),
        x: PLAYER_X_POS + 8,
        y: FIXED_Y - 50,
        damage: dmg,
        targetId,
      });
    }

    // 3. รอจนกว่าลูกไฟจะวิ่งไปชนศัตรู
    let projectileMoving = true;
    while (projectileMoving) {
        await new Promise(r => setTimeout(r, 100));
        if (get().projectiles.length === 0) projectileMoving = false;
    }

    // 4. รอให้ศัตรูเล่นอนิเมชั่นโดนดาเมจ หรือ กระเด็น
    await new Promise((r) => setTimeout(r, 800));

    const aliveCount = get().enemies.filter((e) => e.hp > 0).length;
    if (aliveCount === 0) {
      set({ gameState: "RUN", enemies: [], projectiles: [] });
      return;
    }

    // 5. เริ่มเทิร์นศัตรู
    set({ gameState: "BATTLE_ENEMY" });
    const enemyIds = get().enemies.map((e) => e.id);

    for (const id of enemyIds) {
      const currentEn = get().enemies.find((e) => e.id === id);
      if (!currentEn || currentEn.hp <= 0) continue;

      const moveDelay = 400;

      if (currentEn.isCharging) {
        set((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === id
              ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1, isCharging: false }
              : e
          ),
        }));
        await new Promise((r) => setTimeout(r, moveDelay));

        if (get().enemies.find((e) => e.id === id)?.hp ?? 0 > 0) {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, atkFrame: 2 } : e
            ),
          }));
          get().damagePlayer(currentEn.atk * 3);
        }
      } else {
        if (Math.random() > 0.3) {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, x: PLAYER_X_POS + 8, atkFrame: 1 } : e
            ),
          }));
          await new Promise((r) => setTimeout(r, moveDelay));

          if (get().enemies.find((e) => e.id === id)?.hp ?? 0 > 0) {
            set((s) => ({
              enemies: s.enemies.map((e) =>
                e.id === id ? { ...e, atkFrame: 2 } : e
              ),
            }));
            get().damagePlayer(currentEn.atk);
          }
        } else {
          set((s) => ({
            enemies: s.enemies.map((e) =>
              e.id === id ? { ...e, isCharging: true } : e
            ),
          }));
          get().addPopup({
            id: Math.random(),
            x: currentEn.x,
            y: FIXED_Y - 80,
            value: 0,
          });
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }
      }

      await new Promise((r) => setTimeout(r, moveDelay));
      set((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === id && e.hp > 0 ? { ...e, x: e.targetX, atkFrame: 0 } : e
        ),
      }));
    }

    const finalAlive = get().enemies.filter((e) => e.hp > 0);
    if (finalAlive.length === 0) {
      set({ gameState: "RUN", enemies: [], projectiles: [] });
    } else if (get().playerHp > 0) {
      set({ gameState: "BATTLE_PLAYER" });
    }
  },

  reset: () =>
    set({
      gameState: "RUN",
      playerHp: MAX_PLAYER_HP,
      enemies: [],
      projectiles: [],
      distance: 0,
      damagePopups: [],
    }),

  update: (dt) =>
    set((state) => {
      if (state.gameState === "RUN") {
        const newDist = state.distance + dt * 0.02;
        if (newDist >= 120) {
          setTimeout(() => get().spawnEnemies(), 0);
          return { distance: 0 };
        }
        return { distance: newDist };
      }
      if (state.projectiles.length > 0) {
        const nextProjs = state.projectiles.map((p) => ({
          ...p,
          x: p.x + dt * 0.08,
        }));
        let currentEnemies = [...state.enemies];
        const activeProjs: Projectile[] = [];

        nextProjs.forEach((p) => {
          const target = currentEnemies.find((e) => e.id === p.targetId);
          if (target && p.x >= target.x) {
            target.hp = Math.max(0, target.hp - p.damage);
            get().addPopup({
              id: Math.random(),
              x: target.x + 1,
              y: FIXED_Y - 80,
              value: p.damage,
            });
          } else if (p.x < 110) {
            activeProjs.push(p);
          }
        });
        return { enemies: currentEnemies, projectiles: activeProjs };
      }
      return {};
    }),
}));

export default function GameApp() {
  const store = useGameStore();
  // --- UPDATED: Use ID instead of Index for targeting ---
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [letterBag, setLetterBag] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<
    (InventoryItem | null)[]
  >(new Array(6).fill(null));
  const [animFrame, setAnimFrame] = useState(0);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [playerAtkFrame, setPlayerAtkFrame] = useState(0);
  const [dictionary, setDictionary] = useState<DictEntry[]>([]);
  const [validWordInfo, setValidWordInfo] = useState<DictEntry | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch("http://localhost:3000/dict")
      .then((res) => res.json())
      .then((data) => setDictionary(data))
      .catch(() => {});
    initBag();
  }, []);

  const initBag = () => {
    const bag: string[] = [];
    Object.entries(LETTER_DATA).forEach(([char, info]) => {
      for (let i = 0; i < info.count; i++) bag.push(char);
    });
    setLetterBag(bag);
  };

  const refillInventory = (
    currentInv: InventoryItem[],
    currentBag: string[]
  ) => {
    const needed = 12 - currentInv.length;
    if (needed <= 0 || currentBag.length === 0) return;
    const drawn: InventoryItem[] = [];
    for (let i = 0; i < needed; i++) {
      const char = currentBag[Math.floor(Math.random() * currentBag.length)];
      drawn.push({ char, id: Math.random(), visible: true });
    }
    setInventory([...currentInv, ...drawn]);
  };

  useEffect(() => {
    if (store.gameState === "BATTLE_PLAYER")
      refillInventory(inventory, letterBag);
  }, [store.gameState]);

  useEffect(() => {
    const currentString = selectedLetters
      .filter((l) => l !== null)
      .map((l) => l?.char)
      .join("")
      .toLowerCase();
    if (currentString.length === 0) {
      setValidWordInfo(null);
      return;
    }
    const found = dictionary.find(
      (d) => d.word.toLowerCase() === currentString
    );
    setValidWordInfo(found || null);
  }, [selectedLetters, dictionary]);

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
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAnimFrame((f) => (f === 0 ? 1 : 0)), 250);
    return () => clearInterval(t);
  }, []);

  // --- UPDATED: Handle Attack Logic with ID ---
  const handleAttack = async () => {
    if (
      !validWordInfo ||
      store.enemies.length === 0 ||
      store.gameState !== "BATTLE_PLAYER"
    )
      return;

    const aliveEnemies = store.enemies.filter((e) => e.hp > 0);
    // Use manually selected target, or fallback to the first alive enemy
    let targetId = selectedTargetId;
    
    // Validate if the selected target is still alive
    if (!targetId || !aliveEnemies.find(e => e.id === targetId)) {
        targetId = aliveEnemies[0]?.id;
    }

    if (!targetId) return;

    const activeItems = selectedLetters.filter(
      (l): l is InventoryItem => l !== null
    );
    const score = activeItems.reduce(
      (acc, item) => acc + (LETTER_DATA[item.char]?.score || 1),
      0
    );

    setValidWordInfo(null);
    setSelectedLetters(new Array(6).fill(null));
    
    setIsPlayerAttacking(true);
    setPlayerAtkFrame(1);
    setTimeout(() => setPlayerAtkFrame(2), 200);
    setTimeout(() => {
      setIsPlayerAttacking(false);
      setPlayerAtkFrame(0);
    }, 400);

    await store.endPlayerTurn(score * 10, targetId);
  };

  // --- NEW: SPIN FUNCTION ---
  const handleSpin = () => {
    if (store.gameState !== "BATTLE_PLAYER" || letterBag.length === 0) return;
    
    // เคลียร์กระดานและสุ่ม Inventory ใหม่ 12 ใบ
    setSelectedLetters(new Array(6).fill(null));
    const newDrawn: InventoryItem[] = [];
    for (let i = 0; i < 12; i++) {
      const char = letterBag[Math.floor(Math.random() * letterBag.length)];
      newDrawn.push({ char, id: Math.random(), visible: true });
    }
    setInventory(newDrawn);
  };

  return (
    <div style={uiStyles.wrapper}>
      <div style={uiStyles.gameContainer}>
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
                // Determine active target (selected or default first)
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
                    // --- UPDATED: Click to Select Enemy ---
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTargetId(en.id);
                    }}
                    style={{
                      ...uiStyles.entity,
                      top: FIXED_Y,
                      zIndex: 100 - i,
                      // Highlight on hover or selection
                      filter: isTargeted
                        ? "drop-shadow(0 0 8px yellow)"
                        : "none",
                      cursor: "crosshair", // Visual cue for aiming
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
                  setInventory([]);
                  setSelectedLetters(new Array(6).fill(null));
                  setSelectedTargetId(null);
                }}
                style={uiStyles.restartBtn}
              >
                RESTART
              </button>
            </div>
          )}
        </div>

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
                {store.gameState === "BATTLE_PLAYER"
                  ? "🟢 YOUR TURN"
                  : store.gameState === "ACTION" 
                  ? "⏳ PROCESSING..."
                  : "🔴 ENEMY TURN"}
              </div>
              <div style={uiStyles.slotContainer}>
                {selectedLetters.map((item, i) => (
                  <div
                    key={i}
                    style={uiStyles.slot}
                    onClick={() => {
                      if (item && store.gameState === "BATTLE_PLAYER") {
                        setInventory((prev) => [...prev, item]);
                        const next = [...selectedLetters];
                        next[i] = null;
                        setSelectedLetters(next);
                      }
                    }}
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
                    !validWordInfo || store.gameState !== "BATTLE_PLAYER"
                  }
                  onClick={handleAttack}
                  style={{
                    ...uiStyles.actionBtn,
                    background:
                      validWordInfo && store.gameState === "BATTLE_PLAYER"
                        ? "#ff4500"
                        : "#444",
                    color: "#fff",
                  }}
                >
                  ATTACK
                </button>

                {/* --- SPIN BUTTON --- */}
                <button
                  disabled={store.gameState !== "BATTLE_PLAYER"}
                  onClick={handleSpin}
                  style={{
                    ...uiStyles.actionBtn,
                    background: store.gameState === "BATTLE_PLAYER" ? "#9c27b0" : "#444",
                    color: "#fff",
                  }}
                >
                  SPIN
                </button>

                <button
                  onClick={() => {
                    if (store.gameState === "BATTLE_PLAYER") {
                      const toReturn = selectedLetters.filter(
                        (l): l is InventoryItem => l !== null
                      );
                      setInventory((prev) => [...prev, ...toReturn]);
                      setSelectedLetters(new Array(6).fill(null));
                    }
                  }}
                  style={{
                    ...uiStyles.actionBtn,
                    background: "#ff4d4d",
                    color: "#fff",
                  }}
                >
                  RESET
                </button>
                
                {/* --- REMOVED NEXT TARGET BUTTON (Using Mouse Interaction) --- */}

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
                    onClick={() => {
                      const empty = selectedLetters.indexOf(null);
                      if (empty !== -1 && store.gameState === "BATTLE_PLAYER") {
                        const next = [...selectedLetters];
                        next[empty] = item;
                        setSelectedLetters(next);
                        setInventory((p) =>
                          p.filter((it) => it.id !== item.id)
                        );
                      }
                    }}
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
      </div>
    </div>
  );
}

const uiStyles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    padding: "10px",
    boxSizing: "border-box",
    fontFamily: "monospace",
  },
  gameContainer: {
    width: "100%",
    maxWidth: "800px",
    aspectRatio: "16/9",
    display: "flex",
    flexDirection: "column",
    border: "4px solid #000",
    background: "#B3F1FF",
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
  },
  world: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    borderBottom: "4px solid #000",
  },
  background: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "40px",
    backgroundRepeat: "repeat-x",
    backgroundSize: "40px 40px",
    zIndex: 5,
  },
  entity: {
    position: "absolute",
    width: "56px",
    height: "56px",
    transform: "translateY(-100%)",
  },
  spriteLayer: {
    backgroundPosition: "bottom center",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  },
  fireball: {
    position: "absolute",
    background: "#ff4500",
    borderRadius: "50%",
    zIndex: 15,
    border: "2px solid #fff",
    boxShadow: "0 0 10px #ff4500",
  },
  hpBarBg: {
    position: "absolute",
    top: -12,
    width: "56px",
    height: "6px",
    background: "#333",
    border: "1.5px solid #000",
  },
  hpBarFill: {
    height: "100%",
    background: "#ff4d4d",
    transition: "width 0.3s ease",
  },
  targetArrow: {
    position: "absolute",
    top: -45,
    left: "28px",
    transform: "translateX(-50%)",
    color: "yellow",
    fontSize: "16px",
    textShadow: "2px 2px #000",
  },
  damageText: {
    position: "absolute",
    fontWeight: "900",
    fontSize: "26px",
    textShadow: "2px 2px 0px #000",
    pointerEvents: "none",
    zIndex: 999,
    width: "80px",
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  restartBtn: {
    padding: "12px 24px",
    background: "#ffeb3b",
    border: "4px solid #000",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
  panel: {
    background: "#2c2c2c",
    display: "flex",
    padding: "12px",
    gap: "12px",
    borderTop: "4px solid #000",
  },
  wordSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotContainer: { display: "flex", gap: "6px" },
  slot: {
    width: "45px",
    height: "45px",
    background: "#444",
    border: "2px solid #000",
    borderRadius: "8px",
  },
  letterCard: {
    width: "42px",
    height: "42px",
    background: "#f2a654",
    border: "2px solid #000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    cursor: "pointer",
    position: "relative",
    borderRadius: "4px",
    color: "#000",
  },
  scoreTag: { position: "absolute", bottom: 1, right: 2, fontSize: "8px" },
  inventory: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    background: "#111",
    padding: "10px",
    borderRadius: "8px",
    minHeight: "100px",
    border: "2px solid #444",
  },
  actionBtn: {
    padding: "8px 12px",
    border: "3px solid #000",
    fontWeight: "bold",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    minWidth: "70px",
  },
  meaningTag: {
    position: "absolute",
    bottom: "50%",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.85)",
    color: "#00ffcc",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "2px solid #00ffcc",
    fontSize: "14px",
    fontWeight: "bold",
    zIndex: 50,
  },
};