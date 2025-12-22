import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { UserRegister, UserLogin } from "../types";
const API_URL = import.meta.env.VITE_API_URL || "http://25.16.201.205:3000";

// Register user thunk
export const registerUser = createAsyncThunk<
  any,
  { email: string; username: string; password: string },
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  });

  const data = await res.json();

  if (!data.isSuccess) {
    return rejectWithValue(data.message); //  เอา message backend มาใช้
  }

  return data;
});

//Login
export const loginUser = createAsyncThunk<
  any,
  { username: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  const data = await res.json();

  console.log("login data:", data);

  if (!data.isSuccess) {
    return rejectWithValue(data.message);
  }
  // เก็บ token ไว้จดจำตอน login เก็บไว้ใน localStorage
  localStorage.setItem("token", data.token);

  return data.user;
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
  registerLoading: boolean;
  loginLoading: boolean;
  authLoading: boolean; 
  isAuthenticated: boolean;
  currentUser: UserLogin | null;
  backendRegisMessage: string | null;
  backendLoginMessage: string | null;
}

const initialState: AuthState = {
  registerLoading: false,
  loginLoading: false,
  authLoading: true,
  isAuthenticated: false,
  currentUser: null,
  backendRegisMessage: null,
  backendLoginMessage: null,
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
    // clearErrorLoginMessage: (state) => {
    //   state.backendLoginMessage = null;
    // },
  },
  extraReducers: (builder) => {
    /* REGISTER */
    builder.addCase(registerUser.pending, (state) => {
      state.registerLoading = true;
      state.backendRegisMessage = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.registerLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerLoading = false;
      state.backendRegisMessage =
        action.payload || "register backendRegisMessage";
    });

    //* LOGIN */
    builder.addCase(loginUser.pending, (state) => {
      state.loginLoading = true;
      state.backendLoginMessage = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loginLoading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload.user ?? null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loginLoading = false;
      state.isAuthenticated = false;
      state.backendLoginMessage = action.payload || null;
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
export const { clearErrorRegisMessage } = authSlice.actions;
export default authSlice.reducer;
