import type { StateCreator } from "zustand";
import type { GameStateStore, SkillData, InventoryItem } from "../../types";
import { PLAYER_X_POS, FIXED_Y } from "../constants";
import { sfx } from "../../utils/sfx";
import { CombatSystem, InventoryUtils } from "../../utils/gameSystems";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PlayerSlice {
  playerStat: GameStateStore["playerStat"];
  playerShoutText: string;
  inventory: (InventoryItem | null)[];
  
  // Actions
  damagePlayer: (dmg: number) => void;
  setInventory: (items: (InventoryItem | null)[]) => void;
  startPlayerTurn: () => void;
  actionSpin: (newInventory: (InventoryItem | null)[]) => Promise<void>;
  castSkill: (skill: SkillData, chosenWord: string, targetIds: number[]) => Promise<void>;
}

export const createPlayerSlice: StateCreator<GameStateStore, [], [], PlayerSlice> = (set, get) => ({
  playerStat: {
    max_hp: 10, hp: 10, shield: 0, atk: 1, def: 0,
    max_rp: 3, rp: 3,
    mp: 0, max_mp: 25, unlockedSlots: 10,
  },
  playerShoutText: "",
  inventory: [],

  // 🩸 1. แก้ไข Logic เมื่อผู้เล่นโดนดาเมจ (damagePlayer)
  damagePlayer: (dmg: number) => {
    const { playerStat: stat } = get();
    let remainingDmg: number = dmg;
    let newShield: number = stat.shield;

    // คำนวณดาเมจเข้าโล่ก่อน
    if (newShield > 0) {
      const block: number = Math.min(newShield, remainingDmg);
      newShield -= block;
      remainingDmg -= block;
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 70, value: 0, isPlayer: true });
    }

    // คำนวณ HP ที่เหลือ
    const newHp: number = Math.max(0, stat.hp - remainingDmg);
    
    // ✅ NEW: ถ้าดาเมจเข้าเนื้อ (remainingDmg > 0) ให้เพิ่ม MP
    // สูตร: เพิ่ม MP ตามจำนวนดาเมจที่โดน (โดนแรงยิ่งได้คืนเยอะ) หรือจะฟิกซ์ค่าก็ได้
    let newMp = stat.mp;
    if (remainingDmg > 0) {
        const mpGainOnHit = remainingDmg; // 1 Damage = 1 MP (ปรับสูตรได้)
        newMp = Math.min(stat.max_mp, stat.mp + mpGainOnHit);
        
        // (Optional) Popup บอกว่าได้ MP
        get().addPopup({ id: Math.random(), x: PLAYER_X_POS + 20, y: FIXED_Y - 90, value: mpGainOnHit, isPlayer: true }); 
    }

    set({ playerStat: { ...stat, hp: newHp, shield: newShield, mp: newMp } });

    if (remainingDmg > 0)
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS - 2, y: FIXED_Y - 50, value: remainingDmg, isPlayer: true });
    
    if (newHp <= 0) set({ gameState: "OVER" });
  },

  setInventory: (items: (InventoryItem | null)[]) => set({ inventory: items }),

  // 🔄 2. แก้ไข Logic เริ่มเทิร์น (startPlayerTurn)
  startPlayerTurn: () => {
      const store = get();
      const currentInv = store.inventory;
      const activeSlots = store.playerStat.unlockedSlots;
      const newInventory = InventoryUtils.fillEmptySlots(currentInv, [], activeSlots);

      // ✅ NEW: เพิ่ม MP เมื่อเริ่มเทิร์น (MP Regen)
      const MP_REGEN = 5; // กำหนดค่า Regen ต่อเทิร์นตรงนี้

      set((s) => ({
          gameState: "PLAYERTURN",
          inventory: newInventory,
          playerStat: {
             ...s.playerStat,
             rp: s.playerStat.max_rp,
             shield: 0, // Reset โล่ทุกเทิร์น (ถ้าเกมดีไซน์แบบนี้)
             // เพิ่ม MP ตรงนี้
             mp: Math.min(s.playerStat.max_mp, s.playerStat.mp + MP_REGEN)
          }
      }));
      
      // Popup บอกว่า MP เด้งตอนเริ่มเทิร์น
      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 90, value: 5, isPlayer: true });
  },

  actionSpin: async (newInventory: (InventoryItem | null)[]) => {
    const store = get();
    if (store.playerStat.rp < 1) return;

    set((s) => ({
      playerStat: { ...s.playerStat, rp: s.playerStat.rp - 1 },
      playerShoutText: "REROLL!",
      gameState: "ACTION",
      inventory: newInventory,
    }));

    await store.waitAnim(600);
    set({ playerShoutText: "", gameState: "PLAYERTURN" });
  },

  // ⚔️ 3. แก้ไข castSkill (เอาการเพิ่ม MP ออก)
  castSkill: async (skill: SkillData, chosenWord: string, targetIds: number[]) => {
    const store = get();
    if (store.playerStat.mp < (skill.mpCost || 0)) return;

    set((s) => ({
      playerShoutText: skill.name,
      gameState: "ACTION",
      playerStat: {
        ...s.playerStat,
        mp: s.playerStat.mp - (skill.mpCost || 0),
      },
    }));
    await store.waitAnim(800);

    const isBasicMove = (skill.mpCost || 0) === 0;

    // --- 🛡️ SHIELD LOGIC ---
    if (skill.effectType === "SHIELD") {
      let shieldAmount: number = 0;

      if (isBasicMove) {
        shieldAmount = chosenWord.length * skill.basePower;
      } else {
        shieldAmount = skill.basePower;
      }

      set((s) => ({ playerStat: { ...s.playerStat, shield: s.playerStat.shield + shieldAmount } }));
      
      // ❌ REMOVED: ลบส่วน Regen MP ของ Basic Move ออก
      /* if (isBasicMove) {
         set((s) => ({ playerStat: { ...s.playerStat, mp: Math.min(s.playerStat.max_mp, s.playerStat.mp + 5) } }));
         get().addPopup({ ... });
      }
      */

      get().addPopup({ id: Math.random(), x: PLAYER_X_POS, y: FIXED_Y - 60, value: shieldAmount, isPlayer: false });
    } 
    
    // --- ⚔️ DAMAGE LOGIC ---
    else if (skill.effectType === "DAMAGE") {
      const hitsPerTarget: number = skill.hitCount || 1;
      
      // ❌ REMOVED: ลบส่วน Regen MP ของ Basic Move ออก
      /*
      if (isBasicMove) {
          set((s) => ({ playerStat: { ...s.playerStat, mp: Math.min(s.playerStat.max_mp, s.playerStat.mp + 5) } }));
          get().addPopup({ ... });
      }
      */

      for (const targetId of targetIds) {
        for (let i = 0; i < hitsPerTarget; i++) {
          const target = get().enemies.find((e) => e.id === targetId);
          if (!target || target.hp <= 0) break;

          // ✅ ส่ง parameters เพิ่ม: chosenWord, target, playerStat.atk
          let finalDamage: number = CombatSystem.calculateDamage(
              skill, 
              chosenWord,           // <--- เพิ่ม
              target,               // <--- เพิ่ม
          );

          sfx.playMissle();
          store.alphabetMissle({
            id: Math.random(), x: PLAYER_X_POS + 10, y: FIXED_Y - 50, startY: FIXED_Y - 50,
            damage: finalDamage, targetId: target.id, char: skill.projectileVisual === "V_SHAPE" ? "V" : "",
            visual: skill.projectileVisual, isMiss: false, movementType: skill.projectileVisual === "V_SHAPE" ? "wavy" : "straight",
            scale: 1.0 + chosenWord.length * 0.1, phase: i * 2,
          } as any);

          await delay(150);
        }
      }
    }

    while (get().projectiles.length > 0) await delay(100);
    await delay(500);
    set({ playerShoutText: "" });

    if (get().enemies.filter((e) => e.hp > 0).length === 0) {
        const nextWave: number = store.currentWave + 1;
        if (store.stageData && store.stageData[nextWave]) {
             set({ gameState: "WAVE_CLEARED", playerShoutText: "WAVE CLEARED!" });
             await delay(2000);
             set({ gameState: "ADVANTURE", playerShoutText: "", currentWave: nextWave });
        } else {
             set({ gameState: "GAME_CLEARED", enemies: [], projectiles: [], playerShoutText: "STAGE CLEARED!" });
        }
      return;
    }

    set({ gameState: "PLAYERTURN" });
  },
});