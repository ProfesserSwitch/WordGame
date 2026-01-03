import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { StageType } from "../types";
import { LOADED, LOADING, FAILED, INITIALIZED } from "./const";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const getAllStage = createAsyncThunk<StageType[]>("state/getState", async () => {
  const response = await fetch(`${API_URL}/getAllStage`);
  if (!response.ok) {
    throw new Error("Failed to fetch state");
  }
  console.log("stage data:", response);
  return (await response.json()) as StageType[]; // result.rows (array)
});


export interface StageState {
  stages: StageType[];
  loading: string|boolean;
  error: string | null;
}
const initialState: StageState = {
  stages: [],
  loading: INITIALIZED,
  error: null,
};

const stageSlice = createSlice({
  name: "stage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllStage.pending, (state) => {
      state.loading = LOADING;
      state.error = null;
    });
    builder.addCase(getAllStage.fulfilled, (state, action) => {
      state.loading = LOADED;
      state.stages = action.payload;
    });
    builder.addCase(getAllStage.rejected, (state, action) => {
      state.loading = FAILED;
      state.error = action.error.message || "Failed to fetch stages";
    });
  },
});
export default stageSlice.reducer;
