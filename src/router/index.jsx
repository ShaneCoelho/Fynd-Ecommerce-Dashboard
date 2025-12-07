import { useRoutes, Navigate } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';
import DashboardRoutes from './DashboardRoutes';

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    AuthRoutes,
    DashboardRoutes,
  ]);
}

