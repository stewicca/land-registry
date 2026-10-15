import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import { getReadRegistry } from '@/lib/chain/client';
import { extractMessage } from '@/lib/extractMessage';
import { failed, loaded, loading, notRegistered, selected } from './landSlice';
import { toLandParcel, type LandParcel } from './types';

export const fetchParcelsThunk = createAppAsyncThunk<LandParcel[]>(
  'land/fetchParcels',
  async (_arg, { dispatch, rejectWithValue }) => {
    dispatch(loading());
    try {
      const registry = getReadRegistry();
      const total = Number(await registry.getTotalRegisteredLands());
      const ids = Array.from({ length: total }, (_value, index) => index + 1);
      const parcels = await Promise.all(
        ids.map(async (id) => toLandParcel(id, await registry.getLandDetails(id))),
      );

      dispatch(loaded(parcels));
      return parcels;
    } catch (error) {
      const message = extractMessage(error, 'Could not read the parcel list from the chain');
      dispatch(failed(message));
      return rejectWithValue(message);
    }
  },
  // No guardFlag: a dropped read leaves the page empty, and the double-submit guard exists for writes.
  { uiType: 'fetching' },
);

/** Resolves to null when the id is outside the registered range, which is not an error worth a toast. */
export const fetchParcelThunk = createAppAsyncThunk<LandParcel | null, number>(
  'land/fetchParcel',
  async (landId, { dispatch, rejectWithValue }) => {
    dispatch(loading());
    try {
      const registry = getReadRegistry();
      const parcel = toLandParcel(landId, await registry.getLandDetails(landId));

      dispatch(selected(parcel));
      return parcel;
    } catch (error) {
      const raw = extractMessage(error, '');
      if (/land does not exist/i.test(raw)) {
        dispatch(notRegistered(`Parcel #${landId} is not registered on this chain.`));
        return null;
      }

      const message = raw || `Could not read parcel #${landId} from the chain`;
      dispatch(failed(message));
      return rejectWithValue(message);
    }
  },
  { uiType: 'fetching' },
);
