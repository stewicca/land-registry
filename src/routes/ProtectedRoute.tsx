import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectAuthStatus, selectRole } from '@/features/wallet/walletSlice';
import LoadingScreen from '@/components/LoadingScreen';
import { hasAnyRole, type Role } from '@/utils/role';

interface ProtectedRouteProps {
  children: ReactNode;
  /** When provided, the user's role must be in this list. */
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const status = useAppSelector(selectAuthStatus);
  const role = useAppSelector(selectRole);

  // Wait until the bootstrap refresh has resolved before deciding.
  if (status === 'idle' || status === 'bootstrapping') {
    return <LoadingScreen />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAnyRole(role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
