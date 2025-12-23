import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { UserRegister, UserLogin } from "../types";
import { LOADED,LOADING,FAILED,INITIALIZED } from "./const";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

// Register user thunk
export const registerUser = createAsyncThunk<
  any,
  { email: string; username: string; password: string },
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
    if (!res.ok) {
      return rejectWithValue("Server error, please try again");
    }

    const data = await res.json();

    if (!data.isSuccess) {
      return rejectWithValue(data.message); //  เอา message backend มาใช้
    }

    return data;
  } catch (error) {
    // 🌐 network error / server down / offline
    return rejectWithValue("Network error, please check your connection");
  }
});

//Login
export const loginUser = createAsyncThunk<
  any,
  { username: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    // ❗ backend ตอบ แต่ status ไม่ใช่ 2xx
    if (!res.ok) {
      return rejectWithValue("Server error, please try again");
    }

    const data = await res.json();
    console.log("login data:", data);

    // ❗ backend business error (user/pass ผิด)
    if (!data.isSuccess) {
      return rejectWithValue(data.message);
    }

    localStorage.setItem("token", data.token);
    return data.user;
  } catch (error) {
    // 🌐 network error / server down / offline
    return rejectWithValue("Network error, please check your connection");
  }
});

//logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await fetch(`${API_URL}/logout`, {
    method: "GET",
    credentials: "include",
  });
});

//checkAuth
// export const checkAuth = createAsyncThunk<any, void, { rejectValue: string }>(
//   "auth/checkAuth",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_URL}/checkAuth`, {
//         method: "GET",
//         credentials: "include", // ⭐ เอา cookie ไปเช็ค
//       });

//       if (!res.ok) throw new Error("not auth");
//       return await res.json();
//     } catch {
//       return rejectWithValue("unauthorized");
//     }
//   }
// );
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) throw rejectWithValue("no token");

    const res = await fetch(`${API_URL}/checkAuth`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ⭐ เพิ่มตรงนี้
      },
    });
    if (!res.ok) throw rejectWithValue("unauthorized");

    const data = await res.json();
    return data.user;
  }
);

export interface AuthState {
  registerState: string;
  loginState: string;
  authLoading: boolean;
  isAuthenticated: boolean;
  currentUser: UserLogin | null;
  backendRegisMessage: string | null;
  backendLoginMessage: string | null;
  errorLogin: boolean;
  errorRegister: boolean;
}

const initialState: AuthState = {
  registerState: INITIALIZED,
  loginState: INITIALIZED,
  authLoading: true,
  isAuthenticated: false,
  currentUser: null,
  backendRegisMessage: null,
  backendLoginMessage: null,
  errorLogin: false,
  errorRegister: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.currentUser = null;
      localStorage.removeItem("token");
    },
    clearErrorRegisMessage: (state) => {
      state.backendRegisMessage = null;
    },
    clearErrorLoginMessage: (state) => {
      state.backendLoginMessage = null;
    },
    clearLoginState: (state) => {
      state.loginState = INITIALIZED;
    },
    clearRegisterState: (state) =>{
      state.registerState = INITIALIZED;
    }
  },
  extraReducers: (builder) => {
    /* REGISTER */
    builder.addCase(registerUser.pending, (state) => {
      state.registerState = LOADING;
      state.backendRegisMessage = null;
      state.errorRegister = false;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.registerState = LOADED;
      state.currentUser = action.payload;
      state.errorRegister = false;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerState = FAILED;
      state.backendRegisMessage =
        action.payload || "register backendRegisMessage";
      state.errorRegister = true;
    });

    //* LOGIN */
    builder.addCase(loginUser.pending, (state) => {
      state.loginState = LOADING;
      state.backendLoginMessage = null;
      state.errorLogin = false;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loginState = LOADED;
      state.isAuthenticated = true;
      state.currentUser = action.payload.user ?? null;
      state.errorLogin = false;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loginState = FAILED;
      state.isAuthenticated = false;
      state.backendLoginMessage = action.payload || null;
      state.errorLogin = true;
      // alert("Please try again");
    });

    //* LOGOUT */
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    });

    //* CHECK AUTH */
    builder.addCase(checkAuth.pending, (state) => {
      state.authLoading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.authLoading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload.user;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.authLoading = false;
      state.isAuthenticated = false;
      state.currentUser = null;
    });
  },
});

export const { logout } = authSlice.actions;
export const { clearErrorRegisMessage , clearErrorLoginMessage,clearRegisterState, clearLoginState } = authSlice.actions;
export default authSlice.reducer;
