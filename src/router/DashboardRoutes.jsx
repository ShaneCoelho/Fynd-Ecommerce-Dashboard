import Stats from '../pages/Stats';
import Categories from '../pages/Categories';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ViewProduct from '../pages/ViewProduct';
import ProtectedRoute from '../components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

const DashboardRoutes = {
  path: '/',
  children: [
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <Stats />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/categories',
      element: (
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/products',
      element: (
        <ProtectedRoute>
          <Products />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/products/add',
      element: (
        <ProtectedRoute>
          <AddProduct />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/products/:id',
      element: (
        <ProtectedRoute>
          <ViewProduct />
        </ProtectedRoute>
      ),
    },
    {
      path: '/',
      element: <Navigate to="/dashboard" />,
    },
  ],
};

export default DashboardRoutes;

