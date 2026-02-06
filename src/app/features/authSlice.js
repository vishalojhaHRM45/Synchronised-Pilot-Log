import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/services";


const initialState = {
  name: null,
  email: null,
  role: null,
  EgcaId: null,
  RM_UserId: null,
  isLoading: false,
  isAuthenticated: false,
};

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const response = await authService.verifyUser();
  return response?.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload?.authenticated === true) {
          const { name, email, UserRole, EgcaId, RM_UserId } = action.payload.user;

          Object.assign(state, {
            name,
            email,
            EgcaId,
            RM_UserId,
            role: UserRole?.toLowerCase(),
            isAuthenticated: true,
          });
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        if (!action.error?.message?.includes('401')) {
          console.error("Auth verification failed:", action.error);
        }
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;