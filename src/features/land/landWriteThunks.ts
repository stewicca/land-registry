import toast from 'react-hot-toast';
import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import type { AppDispatch } from '@/app/store';
import { getSignerRegistry, type LandRegistryContract } from '@/lib/chain/client';
import { extractMessage } from '@/lib/extractMessage';
import { fetchParcelsThunk } from './landThunks';

type RegistryAction = (registry: LandRegistryContract) => Promise<{ hash: string; wait: () => Promise<unknown> }>;

async function sendAndRefresh(dispatch: AppDispatch, action: RegistryAction): Promise<string> {
  const registry = await getSignerRegistry();
  const transaction = await action(registry);
  await transaction.wait();
  await dispatch(fetchParcelsThunk());
  return transaction.hash;
}

const writeOptions = { uiType: 'submitting', guardFlag: 'isSubmitting' } as const;

export const registerLandThunk = createAppAsyncThunk<
  string,
  { coordinates: string; area: number; owner: string }
>(
  'land/registerLand',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.registerLand(input.coordinates, input.area, input.owner),
      );
      toast.success('Parcel registered');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Registration failed'));
    }
  },
  writeOptions,
);

export const addLandDocumentThunk = createAppAsyncThunk<
  string,
  { landId: number; ipfsHash: string }
>(
  'land/addLandDocument',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.addLandDocument(input.landId, input.ipfsHash),
      );
      toast.success('Document hash attached');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Attaching the document failed'));
    }
  },
  writeOptions,
);

export const registerNotaryThunk = createAppAsyncThunk<string, { notary: string }>(
  'land/registerNotary',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) => registry.registerNotary(input.notary));
      toast.success('Notary registered');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Registering the notary failed'));
    }
  },
  writeOptions,
);

export const transferOwnershipThunk = createAppAsyncThunk<
  string,
  { landId: number; newOwner: string }
>(
  'land/transferOwnership',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.transferOwnership(input.landId, input.newOwner),
      );
      toast.success('Ownership transferred');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'The transfer failed'));
    }
  },
  writeOptions,
);

export const updateLandStatusThunk = createAppAsyncThunk<
  string,
  { landId: number; status: number }
>(
  'land/updateLandStatus',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.updateLandStatus(input.landId, input.status),
      );
      toast.success('Status updated');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Updating the status failed'));
    }
  },
  writeOptions,
);

export const updateLandAreaThunk = createAppAsyncThunk<string, { landId: number; newArea: number }>(
  'land/updateLandArea',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.updateLandArea(input.landId, input.newArea),
      );
      toast.success('Area updated');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Updating the area failed'));
    }
  },
  writeOptions,
);

export const revokeLandRegistrationThunk = createAppAsyncThunk<string, { landId: number }>(
  'land/revokeLandRegistration',
  async (input, { dispatch, rejectWithValue }) => {
    try {
      const hash = await sendAndRefresh(dispatch, (registry) =>
        registry.revokeLandRegistration(input.landId),
      );
      toast.success('Registration revoked');
      return hash;
    } catch (error) {
      return rejectWithValue(extractMessage(error, 'Revoking the registration failed'));
    }
  },
  writeOptions,
);
