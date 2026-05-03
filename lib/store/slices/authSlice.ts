import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Mock login thunk - simulates API call
export const login = createAsyncThunk<
  User,
  { email: string; password: string }
>(
  'auth/login',
  async ({ email, password }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      throw new Error('Email and password required');
    }

    const user: User = {
      id: 'user_123',
      email,
      name: email.split('@')[0],
    };

    // FEATURE 01: Data hydration (fetchTransactions, fetchCryptoPrices, fetchRates)
    // is handled by listenerMiddleware on login.fulfilled — not dispatched here.
    // This keeps the thunk focused on authentication only.

    return user;
  }
);

export const logout = createAsyncThunk<null, void>('auth/logout', async () => {
  // Simulate cleanup
  await new Promise((resolve) => setTimeout(resolve, 300));
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Logout failed';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
