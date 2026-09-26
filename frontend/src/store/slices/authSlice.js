import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getMe();
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const switchUserPersona = createAsyncThunk(
  'auth/switchUserPersona',
  async (role, { rejectWithValue }) => {
    try {
      const res = await authApi.switchPersona(role);
      if (res.data.token) {
        localStorage.setItem('resource_token', res.data.token);
      }
      if (res.data.user?._id) {
        localStorage.setItem('resource_user_id', res.data.user._id);
      }
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to switch persona');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    activeRole: 'buyer', // 'buyer' | 'seller' | 'admin'
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.activeRole = action.payload?.role || 'buyer';
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('resource_token');
      localStorage.removeItem('resource_user_id');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.activeRole = action.payload?.role || 'buyer';
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(switchUserPersona.fulfilled, (state, action) => {
        state.user = action.payload;
        state.activeRole = action.payload?.role || 'buyer';
      });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
