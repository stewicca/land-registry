import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '@/features/wallet/walletSlice';
import landReducer from '@/features/land/landSlice';
import uiReducer from '@/features/ui/uiSlice';
import { asyncStatusMiddleware } from '@/features/ui/asyncStatusMiddleware';

// Add your feature reducers here as the app grows.
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    land: landReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(asyncStatusMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
