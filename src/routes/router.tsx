import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ParcelsPage from '@/pages/ParcelsPage';
import ParcelDetailPage from '@/pages/ParcelDetailPage';
import NotFoundPage from '@/pages/NotFoundPage';

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
    path: '*',
    element: <NotFoundPage />,
  },
]);
