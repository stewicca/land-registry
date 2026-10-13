import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';

/** Which global UI flag a thunk drives while it is pending. */
export type UiActionType = 'fetching' | 'submitting';

/** Meta attached to the `pending` action so `asyncStatusMiddleware` knows which flag to raise. */
export interface ThunkMeta {
  uiType?: UiActionType;
}

export interface ThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
  pendingMeta: ThunkMeta;
}

interface Options {
  /** Global loading flag to drive (`isFetching` for reads, `isSubmitting` for writes). */
  uiType?: UiActionType;
  /** When set, the thunk is skipped if this flag is already true (prevents double-submits). */
  guardFlag?: 'isFetching' | 'isSubmitting';
}

/**
 * Typed wrapper around `createAsyncThunk` that:
 *  - tags the pending action with `meta.uiType` so the UI middleware can flip the right flag, and
 *  - optionally guards against concurrent dispatches.
 */
export function createAppAsyncThunk<Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: Parameters<typeof createAsyncThunk<Returned, ThunkArg, ThunkConfig>>[1],
  options: Options = {},
) {
  const { uiType, guardFlag } = options;
  return createAsyncThunk<Returned, ThunkArg, ThunkConfig>(typePrefix, payloadCreator, {
    condition: (_arg, { getState }) => {
      if (!guardFlag) return true;
      return !getState().ui[guardFlag];
    },
    getPendingMeta: () => (uiType ? { uiType } : {}),
  });
}
