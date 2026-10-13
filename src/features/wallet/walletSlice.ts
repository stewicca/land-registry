import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/utils/role';
import type { RootState } from '@/app/store';

export type WalletStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'unauthenticated';

interface WalletState {
  address: string | null;
  role: Role | null;
  status: WalletStatus;
}

const initialState: WalletState = {
  address: null,
  role: null,
  status: 'idle',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connected: (state, action: PayloadAction<{ address: string; role: Role }>) => {
      state.address = action.payload.address;
      state.role = action.payload.role;
      state.status = 'authenticated';
    },
    disconnected: (state) => {
      state.address = null;
      state.role = null;
      state.status = 'unauthenticated';
    },
    setStatus: (state, action: PayloadAction<WalletStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { connected, disconnected, setStatus } = walletSlice.actions;

export const selectAddress = (state: RootState) => state.wallet.address;
export const selectRole = (state: RootState) => state.wallet.role;
export const selectWalletStatus = (state: RootState) => state.wallet.status;

/** Alias kept so ProtectedRoute and AuthRedirect stay unchanged. */
export const selectAuthStatus = selectWalletStatus;

export const selectUsername = (state: RootState) => {
  const address = state.wallet.address;
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;
};

export const selectIsAuthenticated = (state: RootState) =>
  state.wallet.status === 'authenticated' && state.wallet.address !== null;

export default walletSlice.reducer;
