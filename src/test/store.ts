import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '@/features/wallet/walletSlice';
import uiReducer from '@/features/ui/uiSlice';
import { asyncStatusMiddleware } from '@/features/ui/asyncStatusMiddleware';

/** Build a full-shape store for use in thunk tests. Mirror `app/store.ts` when reducers change. */
export const makeTestStore = () =>
  configureStore({
    reducer: {
      wallet: walletReducer,
      ui: uiReducer,
    },
    middleware: (getDefault) => getDefault().concat(asyncStatusMiddleware),
  });
