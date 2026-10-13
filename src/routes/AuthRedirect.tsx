import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthStatus } from '@/features/wallet/walletSlice';
import LoadingScreen from '@/components/LoadingScreen';

/** Sends the user to the dashboard or the login page based on the bootstrapped session. */
export default function AuthRedirect() {
  const status = useAppSelector(selectAuthStatus);

  if (status === 'idle' || status === 'bootstrapping') {
    return <LoadingScreen />;
  }

  return <Navigate to={status === 'authenticated' ? '/dashboard' : '/login'} replace />;
}
