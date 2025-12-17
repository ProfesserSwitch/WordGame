import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { StageType } from "../types";
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
  loading: boolean;
  error: string | null;
}
const initialState: StageState = {
  stages: [],
  loading: false,
  error: null,
};

const stageSlice = createSlice({
  name: "stage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllStage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllStage.fulfilled, (state, action) => {
      state.loading = false;
      state.stages = action.payload;
    });
    builder.addCase(getAllStage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch stages";
    });
  },
});
export default stageSlice.reducer;
