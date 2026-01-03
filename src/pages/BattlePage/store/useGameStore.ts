import { create } from "zustand";
import type { GameStateStore } from "../types";
import { createGameSlice } from "./slices/createGameSlice";
import { createEnemySlice } from "./slices/createEnemySlice";
import { createPlayerSlice } from "./slices/createPlayerSlice";

// รวม Slices ทั้งหมดเข้าด้วยกัน
export const useGameStore = create<GameStateStore>()((...a) => ({
  ...createGameSlice(...a),
  ...createEnemySlice(...a),
  ...createPlayerSlice(...a),
}));