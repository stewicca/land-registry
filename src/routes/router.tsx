import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ParcelsPage from '@/pages/ParcelsPage';
import ParcelDetailPage from '@/pages/ParcelDetailPage';
import AdminPage from '@/pages/AdminPage';
import MyParcelsPage from '@/pages/MyParcelsPage';
import NotaryPage from '@/pages/NotaryPage';
import AuditPage from '@/pages/AuditPage';
import BankPage from '@/pages/BankPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { ADMIN_ROLES } from '@/utils/role';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/parcels" replace />,
  },
  {
    path: '/parcels',
    element: <ParcelsPage />,
  },
  {
    path: '/parcels/:id',
    element: <ParcelDetailPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={ADMIN_ROLES}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-parcels',
    element: (
      <ProtectedRoute allowedRoles={['OWNER']}>
        <MyParcelsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notary',
    element: (
      <ProtectedRoute allowedRoles={['NOTARY']}>
        <NotaryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit',
    element: (
      <ProtectedRoute allowedRoles={['AUDITOR']}>
        <AuditPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/verify',
    element: (
      <ProtectedRoute allowedRoles={['BANK']}>
        <BankPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
