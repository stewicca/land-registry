import toast from 'react-hot-toast';
import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import { extractMessage } from '@/lib/extractMessage';
import { currentAccounts, hasWallet, requestAccounts } from '@/lib/chain/client';
import type { Role } from '@/utils/role';
import { connected, disconnected, setStatus } from './walletSlice';

/** ponytail: every connected account counts as USER until role reads land in phase 2. */
const CONNECTED_ROLE: Role = 'USER';

export const connectWalletThunk = createAppAsyncThunk<string>(
  'wallet/connect',
  async (_arg, { dispatch, rejectWithValue }) => {
    if (!hasWallet()) {
      return rejectWithValue('No wallet detected. Install MetaMask and reload.');
    }
    try {
      const [address] = await requestAccounts();
      if (!address) return rejectWithValue('No account was authorized.');

      dispatch(connected({ address, role: CONNECTED_ROLE }));
      toast.success('Wallet connected');
      return address;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Failed to connect wallet'));
    }
  },
  { uiType: 'submitting', guardFlag: 'isSubmitting' },
);

export const bootstrapWalletThunk = createAppAsyncThunk<void>(
  'wallet/bootstrap',
  async (_arg, { dispatch }) => {
    dispatch(setStatus('bootstrapping'));
    if (!hasWallet()) {
      dispatch(disconnected());
      return;
    }
    try {
      const [address] = await currentAccounts();
      if (address) dispatch(connected({ address, role: CONNECTED_ROLE }));
      else dispatch(disconnected());
    } catch {
      dispatch(disconnected());
    }
  },
);

export const disconnectWalletThunk = createAppAsyncThunk<void>(
  'wallet/disconnect',
  async (_arg, { dispatch }) => {
    dispatch(disconnected());
  },
);
