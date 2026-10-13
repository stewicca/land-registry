import toast from 'react-hot-toast';
import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import type { AppDispatch } from '@/app/store';
import { extractMessage } from '@/lib/extractMessage';
import {
  currentAccounts,
  currentChainId,
  getRegistry,
  hasWallet,
  onAccountsChanged,
  requestAccounts,
  type LandRegistryContract,
} from '@/lib/chain/client';
import type { Role } from '@/utils/role';
import { connected, disconnected, setChainId, setStatus } from './walletSlice';

/** ponytail: one read per registered parcel on connect. An owner index in the contract replaces this if the registry grows. */
async function ownsAnyParcel(registry: LandRegistryContract, address: string): Promise<boolean> {
  const total = Number(await registry.getTotalRegisteredLands());
  for (let landId = 1; landId <= total; landId++) {
    if ((await registry.getLandOwner(landId)).toLowerCase() === address.toLowerCase()) return true;
  }
  return false;
}

async function resolveRole(address: string): Promise<Role> {
  const registry = await getRegistry();
  if ((await registry.admin()).toLowerCase() === address.toLowerCase()) return 'ADMIN';
  if (await registry.notaries(address)) return 'NOTARY';
  if (await ownsAnyParcel(registry, address)) return 'OWNER';
  return 'USER';
}

async function startSession(address: string, dispatch: AppDispatch): Promise<string> {
  const role = await resolveRole(address);
  dispatch(connected({ address, role }));
  dispatch(setChainId(await currentChainId()));
  return address;
}

let watchingAccounts = false;

function watchAccountChanges(dispatch: AppDispatch): void {
  watchingAccounts = true;
  onAccountsChanged((accounts) => {
    const [address] = accounts;
    if (!address) {
      dispatch(disconnected());
      return;
    }
    startSession(address, dispatch).catch(() => dispatch(disconnected()));
  });
}

export const connectWalletThunk = createAppAsyncThunk<string>(
  'wallet/connect',
  async (_arg, { dispatch, rejectWithValue }) => {
    if (!hasWallet()) {
      return rejectWithValue('No wallet detected. Install MetaMask and reload.');
    }
    try {
      const [address] = await requestAccounts();
      if (!address) return rejectWithValue('No account was authorized.');

      await startSession(address, dispatch);
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
      if (!address) {
        dispatch(disconnected());
        return;
      }
      await startSession(address, dispatch);
      if (!watchingAccounts) watchAccountChanges(dispatch);
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
