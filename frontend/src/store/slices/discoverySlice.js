import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { discoveryApi } from '../../services/api';

export const runAiDiscovery = createAsyncThunk(
  'discovery/runAiDiscovery',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await discoveryApi.submitAndMatch(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'AI discovery failed');
    }
  }
);

export const fetchOpportunities = createAsyncThunk(
  'discovery/fetchOpportunities',
  async (_, { rejectWithValue }) => {
    try {
      const res = await discoveryApi.getOpportunities();
      return res.data.opportunities;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch opportunities');
    }
  }
);

export const fetchOpportunityById = createAsyncThunk(
  'discovery/fetchOpportunityById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await discoveryApi.getOpportunityById(id);
      return res.data.opportunity;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch opportunity');
    }
  }
);

const discoverySlice = createSlice({
  name: 'discovery',
  initialState: {
    opportunities: [],
    currentOpportunity: null,
    latestResult: null,
    analyzing: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOpportunity: (state) => {
      state.currentOpportunity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAiDiscovery.pending, (state) => {
        state.analyzing = true;
        state.error = null;
      })
      .addCase(runAiDiscovery.fulfilled, (state, action) => {
        state.analyzing = false;
        state.latestResult = action.payload;
        state.opportunities = action.payload.opportunities || [];
      })
      .addCase(runAiDiscovery.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.opportunities = action.payload;
      })
      .addCase(fetchOpportunityById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOpportunityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOpportunity = action.payload;
      })
      .addCase(fetchOpportunityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOpportunity } = discoverySlice.actions;
export default discoverySlice.reducer;
