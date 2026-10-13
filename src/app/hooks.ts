import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Use these throughout the app instead of the plain `useDispatch`/`useSelector`
// so dispatch is typed for thunks and selectors receive the full RootState.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
