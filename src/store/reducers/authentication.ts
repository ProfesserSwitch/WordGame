import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { UserRegister, UserLogin } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

// Register user thunk
export const registerUser = createAsyncThunk<
  any,
  { email: string; username: string; password: string },
  { rejectValue: string } 
>(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!data.isSuccess) {
      return rejectWithValue(data.message); //  เอา message backend มาใช้
    }

    return data;
  }
);

//Login 
export const loginUser = createAsyncThunk<
  any,
  { username: string; password: string },
  { rejectValue: string }
>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();

    console.log("login data:", data);

    if (!data.isSuccess) {
      return rejectWithValue(data.message);
    }
    return data;
  }
);


export interface AuthState {
  playRegister: UserRegister[];
  currentUser: UserRegister | null;
  registerState: boolean;
  backendRegisMessage: string | null;

  playerLogin: UserLogin[];
  currentUserLogin: UserLogin | null;
  LoginState: boolean;
  backendLoginMessage: string | null;
}

const initialState: AuthState = {
  playRegister: [],
  currentUser: null,
  registerState: false,
  backendRegisMessage: null,

  playerLogin: [],
  currentUserLogin: null,
  LoginState: false,
  backendLoginMessage: null,

};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null;
      localStorage.removeItem("token");
    },
    clearErrorRegisMessage: (state) => {
      state.backendRegisMessage = null;
    },
    // clearErrorLoginMessage: (state) => {
    //   state.backendLoginMessage = null;
    // },
  },
  extraReducers: (builder) => {
    /* REGISTER */
    builder.addCase(registerUser.pending, (state) => {
      state.registerState = true;
      state.backendRegisMessage = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.registerState =  false;
      state.currentUser = action.payload;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerState = false;
      state.backendRegisMessage = action.payload || "register backendRegisMessage";
    });

    //* LOGIN */
    builder.addCase(loginUser.pending, (state) => {
      state.LoginState = true;
      state.backendLoginMessage = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.LoginState = false;
      state.currentUserLogin = action.payload;
    }); 
    builder.addCase(loginUser.rejected, (state, action) => {
      state.LoginState = false;
      state.backendLoginMessage = action.payload || "login backendLoginMessage";
    });

  },
});

export const { logout } = authSlice.actions;
export const { clearErrorRegisMessage,  } = authSlice.actions;
export default authSlice.reducer;