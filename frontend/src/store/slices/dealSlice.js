import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealApi, priceRequestApi, assessmentApi, exchangeApi, paymentApi } from '../../services/api';

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (_, { rejectWithValue }) => {
    try {
      const res = await dealApi.getDeals();
      return res.data.deals;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

export const fetchDealById = createAsyncThunk(
  'deals/fetchDealById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await dealApi.getDealById(id);
      return res.data.deal;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch deal details');
    }
  }
);

export const submitPriceRequest = createAsyncThunk(
  'deals/submitPriceRequest',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await priceRequestApi.submitPriceRequest(data);
      dispatch(fetchDealById(data.dealId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit price request');
    }
  }
);

export const acceptPriceRequest = createAsyncThunk(
  'deals/acceptPriceRequest',
  async ({ requestId, dealId }, { dispatch, rejectWithValue }) => {
    try {
      const res = await priceRequestApi.acceptPriceRequest(requestId);
      dispatch(fetchDealById(dealId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept price request');
    }
  }
);

export const counterPriceRequest = createAsyncThunk(
  'deals/counterPriceRequest',
  async ({ requestId, dealId, counterPrice, note }, { dispatch, rejectWithValue }) => {
    try {
      const res = await priceRequestApi.counterPriceRequest(requestId, { counterPrice, note });
      dispatch(fetchDealById(dealId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to counter price request');
    }
  }
);

export const buyerAcceptCounter = createAsyncThunk(
  'deals/buyerAcceptCounter',
  async ({ requestId, dealId }, { dispatch, rejectWithValue }) => {
    try {
      const res = await priceRequestApi.buyerAcceptCounter(requestId);
      dispatch(fetchDealById(dealId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to accept counter price');
    }
  }
);

export const rejectPriceRequest = createAsyncThunk(
  'deals/rejectPriceRequest',
  async ({ requestId, dealId, reason }, { dispatch, rejectWithValue }) => {
    try {
      const res = await priceRequestApi.rejectPriceRequest(requestId, { reason });
      dispatch(fetchDealById(dealId));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject price request');
    }
  }
);

const dealSlice = createSlice({
  name: 'deals',
  initialState: {
    deals: [],
    activeDeal: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearActiveDeal: (state) => {
      state.activeDeal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeDeal = action.payload;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitPriceRequest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(submitPriceRequest.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(submitPriceRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActiveDeal } = dealSlice.actions;
export default dealSlice.reducer;
