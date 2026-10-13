import { isAsyncThunkAction, isPending, isFulfilled, isRejected } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import type { ThunkMeta } from '@/app/createAppAsyncThunk';
import { setError, startLoading, stopLoading } from './uiSlice';

/**
 * Translates every async thunk lifecycle into global UI state so individual components
 * don't have to track loading/error themselves.
 *
 *   pending   → startLoading(uiType)
 *   fulfilled → stopLoading()
 *   rejected  → setError(message) + error toast (skipped for aborted/condition-guarded thunks)
 */
export const asyncStatusMiddleware: Middleware = (store) => (next) => (action) => {
  if (isAsyncThunkAction(action)) {
    if (isPending(action)) {
      const meta = action.meta as typeof action.meta & ThunkMeta;
      store.dispatch(startLoading(meta.uiType));
    } else if (isFulfilled(action)) {
      store.dispatch(stopLoading());
    } else if (isRejected(action)) {
      const message =
        (typeof action.payload === 'string' ? action.payload : undefined) ??
        action.error?.message ??
        'An unexpected error occurred';

      if (action.meta.aborted || action.meta.condition) {
        store.dispatch(stopLoading());
      } else {
        store.dispatch(setError(message));
        toast.error(message);
      }
    }
  }

  return next(action);
};
