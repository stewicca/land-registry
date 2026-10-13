import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { UiActionType } from '@/app/createAppAsyncThunk';

interface UiState {
  isFetching: boolean;   // a read (GET) is in flight
  isSubmitting: boolean; // a write (POST/PUT/DELETE) is in flight
  error: string | null;
}

const initialState: UiState = {
  isFetching: false,
  isSubmitting: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startLoading: (state, action: PayloadAction<UiActionType | undefined>) => {
      if (action.payload === 'submitting') state.isSubmitting = true;
      else state.isFetching = true;
      state.error = null;
    },
    stopLoading: (state) => {
      state.isFetching = false;
      state.isSubmitting = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.isFetching = false;
      state.isSubmitting = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { startLoading, stopLoading, setError, clearError } = uiSlice.actions;

export const selectIsFetching  = (state: RootState) => state.ui.isFetching;
export const selectIsSubmitting = (state: RootState) => state.ui.isSubmitting;
export const selectIsBusy      = (state: RootState) => state.ui.isFetching || state.ui.isSubmitting;
export const selectUiError     = (state: RootState) => state.ui.error;

export default uiSlice.reducer;
