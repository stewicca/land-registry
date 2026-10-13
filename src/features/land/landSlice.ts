import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { LandParcel } from './types';

export type LandViewStatus = 'idle' | 'loading' | 'ready' | 'not-registered' | 'error';

interface LandState {
  parcels: LandParcel[];
  selected: LandParcel | null;
  status: LandViewStatus;
  error: string | null;
}

const initialState: LandState = {
  parcels: [],
  selected: null,
  status: 'idle',
  error: null,
};

const landSlice = createSlice({
  name: 'land',
  initialState,
  reducers: {
    loading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loaded: (state, action: PayloadAction<LandParcel[]>) => {
      state.parcels = action.payload;
      state.status = 'ready';
    },
    selected: (state, action: PayloadAction<LandParcel>) => {
      state.selected = action.payload;
      state.status = 'ready';
    },
    notRegistered: (state, action: PayloadAction<string>) => {
      state.selected = null;
      state.status = 'not-registered';
      state.error = action.payload;
    },
    failed: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { failed, loaded, loading, notRegistered, selected } = landSlice.actions;

export const selectParcels = (state: RootState) => state.land.parcels;
export const selectSelectedParcel = (state: RootState) => state.land.selected;
export const selectLandStatus = (state: RootState) => state.land.status;
export const selectLandError = (state: RootState) => state.land.error;

export default landSlice.reducer;
