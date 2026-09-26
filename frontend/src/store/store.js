import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resourceReducer from './slices/resourceSlice';
import dealReducer from './slices/dealSlice';
import discoveryReducer from './slices/discoverySlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resources: resourceReducer,
    deals: dealReducer,
    discovery: discoveryReducer,
    notifications: notificationReducer,
  },
});

export default store;
