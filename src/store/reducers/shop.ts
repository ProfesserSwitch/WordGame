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

export const searchShopItems = createAsyncThunk<ShopType[], string>(
  "shop/searchShopItems",
  async (searchTerm) => {
    const response = await fetch(
      `${API_URL}/searchShop/${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
      throw new Error("Failed to search shop items");
    }

    return (await response.json()) as ShopType[];
  }
);


export interface ShopState {
  allShops: ShopType[];
  item: ShopType[];
  loading: boolean;
  error: string | null;

  
}

const initialState: ShopState = {
  allShops: [],
  item: [],

  loading: false,
  error: null,
};

const shopSlice = createSlice({
  name: "Shop",
  initialState,
  reducers: {
    ClearShopItems(state) {
      state.item = state.allShops;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(getShop.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getShop.fulfilled, (state, action) => {
      state.loading = false;
      state.allShops = action.payload;
      state.item = action.payload;
    });
    builder.addCase(getShop.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch stages";
    });

    /* ===== SEARCH SHOP ===== */
    builder.addCase(searchShopItems.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(searchShopItems.fulfilled, (state, action) => {
      state.loading = false;
      state.item = action.payload;
    });
    builder.addCase(searchShopItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to search shop";
    });
  },
});

export default shopSlice.reducer;
export const { ClearShopItems } = shopSlice.actions;
