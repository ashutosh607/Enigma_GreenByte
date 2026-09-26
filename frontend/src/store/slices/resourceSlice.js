import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourceApi } from '../../services/api';

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await resourceApi.getResources(filters);
      return res.data.resources;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch resources');
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await resourceApi.getResourceById(id);
      return res.data.resource;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch resource');
    }
  }
);

const resourceSlice = createSlice({
  name: 'resources',
  initialState: {
    items: [],
    selectedResource: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      category: 'All',
      region: 'All',
      availability: 'All',
      processingRequired: 'All',
      evidenceStatus: 'All',
      identityVisibility: 'All',
      sellingMethod: 'All',
      minPrice: '',
      maxPrice: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: 'All',
        region: 'All',
        availability: 'All',
        processingRequired: 'All',
        evidenceStatus: 'All',
        identityVisibility: 'All',
        sellingMethod: 'All',
        minPrice: '',
        maxPrice: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters } = resourceSlice.actions;
export default resourceSlice.reducer;
