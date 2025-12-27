import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LOADED, LOADING, FAILED, INITIALIZED } from "./const";
import type { MonsterType } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const getMonsters = createAsyncThunk<MonsterType[]>(
  "monster/getMonsters",
  async () => {
    const response = await fetch(`${API_URL}/monsters`);
    if (!response.ok) {
      throw new Error("Failed to fetch monsters");
    }
    return (await response.json()) as MonsterType[]; // result.rows (array)
  } 
);

export interface MonsterState {
  monsters: MonsterType[];
  loading: string | boolean;
  error: string | null;
}
const initialState: MonsterState = {
  monsters: [],
  loading: INITIALIZED,
  error: null,
};
const monsterSlice = createSlice({
    name: "Monster",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(getMonsters.pending, (state) => {
        state.loading = LOADING;
        state.error = null;
      });
        builder.addCase(getMonsters.fulfilled, (state, action) => {
        state.loading = LOADED;
        state.monsters = action.payload;
      });
      builder.addCase(getMonsters.rejected, (state, action) => {
        state.loading = FAILED;
        state.error = action.error.message || "Failed to fetch monsters";
      });
    },
});

export default monsterSlice.reducer;