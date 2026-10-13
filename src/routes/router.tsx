import { createBrowserRouter } from 'react-router-dom';
import AuthRedirect from './AuthRedirect';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
// import { ADMIN_ROLES } from '@/utils/role';

// Add new routes here. For admin-only routes, pass: allowedRoles={ADMIN_ROLES}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthRedirect />,
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
  // Example protected page:
  // {
  //   path: '/items',
  //   element: (
  //     <ProtectedRoute>
  //       <ItemsPage />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
