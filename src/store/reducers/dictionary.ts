import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { LOADED, LOADING, FAILED, INITIALIZED } from "./const";
import type {
  DictionaryFilterRequest,
  DictionaryResponse,
  DictionaryWord,
} from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

// post ที่แปลว่า get
export const fetchDictionary = createAsyncThunk<
  DictionaryResponse,
  DictionaryFilterRequest,
  { rejectValue: string }
>("dictionary/fetch", async (payload, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_URL}/dict/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return rejectWithValue("Fetch dictionary failed");
    }

    return (await res.json()) as DictionaryResponse;
  } catch (error) {
    return rejectWithValue("Network error");
  }
});

export interface DictionaryState {
  loading: string | boolean;
  error: string | null;
  count: number;
  hasNext: boolean;
  lastWord: string | null;
  words: DictionaryWord[];

}
const initialState: DictionaryState = {
  // loading: INITIALIZED,
  // error: null,

  loading: INITIALIZED,
  error: null,
  count: 0,
  hasNext: false,
  lastWord: null,
  words: [],
};
const dictionarySlice = createSlice({
  name: "Dictionary",
  initialState,
  reducers: {
    clearDictionary(state) {
      state.words = [];
      state.count = 0;
      state.hasNext = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDictionary.pending, (state) => {
      state.loading = LOADING;
      state.error = null;
    });
    builder.addCase(fetchDictionary.fulfilled, (state, action) => {
      state.loading = LOADED;
      state.count = action.payload.count;
      state.hasNext = action.payload.hasNext;
      state.lastWord = action.payload.lastWord;
     
      if (action.meta.arg.append) {
        state.words.push(...action.payload.data); 
      } else {
        state.words = action.payload.data;
      }
    });
    builder.addCase(fetchDictionary.rejected, (state, action) => {
      state.loading = FAILED;
      state.error = action.payload ?? "Unknown error";
    });
  },
});
export const { clearDictionary, } = dictionarySlice.actions;
export default dictionarySlice.reducer;
