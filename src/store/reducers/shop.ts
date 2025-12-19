import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ShopType } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

export const getShop = createAsyncThunk<ShopType[]>(
  "shop/getShop",
  async () => {
    const response = await fetch(`${API_URL}/shop`);

    if (!response.ok) {
      throw new Error("Failed to fetch shop");
    }
    return (await response.json()) as ShopType[]; // result.rows (array)
  }
);

export interface ShopState {
  shops: ShopType[];
  loading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shops: [],
  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: "Shop",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(getShop.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getShop.fulfilled, (state, action) => {
      state.loading = false;
      state.shops = action.payload;
    });
    builder.addCase(getShop.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch stages";
    });
  },
});

export default shopSlice.reducer;
