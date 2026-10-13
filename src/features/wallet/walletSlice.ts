import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '@/utils/role';
import type { RootState } from '@/app/store';
import { CHAIN_ID } from '@/lib/chain/config';

export type WalletStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'unauthenticated';

interface WalletState {
  address: string | null;
  role: Role | null;
  chainId: number | null;
  status: WalletStatus;
}

const initialState: WalletState = {
  address: null,
  role: null,
  chainId: null,
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
      state.chainId = null;
      state.status = 'unauthenticated';
    },
    setStatus: (state, action: PayloadAction<WalletStatus>) => {
      state.status = action.payload;
    },
    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
  },
});

export const { connected, disconnected, setChainId, setStatus } = walletSlice.actions;

export const selectAddress = (state: RootState) => state.wallet.address;
export const selectRole = (state: RootState) => state.wallet.role;
export const selectChainId = (state: RootState) => state.wallet.chainId;
export const selectWalletStatus = (state: RootState) => state.wallet.status;

/** Alias kept so ProtectedRoute and AuthRedirect stay unchanged. */
export const selectAuthStatus = selectWalletStatus;

export const selectIsWrongChain = (state: RootState) =>
  state.wallet.chainId !== null && state.wallet.chainId !== CHAIN_ID;

export const selectUsername = (state: RootState) => {
  const address = state.wallet.address;
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;
};

export const selectIsAuthenticated = (state: RootState) =>
  state.wallet.status === 'authenticated' && state.wallet.address !== null;

export default walletSlice.reducer;
