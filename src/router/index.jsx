import { useRoutes } from 'react-router-dom';
import Login from '../pages/Login';
import Loading from '../pages/Loading';
import Stats from '../pages/Stats';
import Categories from '../pages/Categories';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ViewProduct from '../pages/ViewProduct';
import ProtectedRoute from '../components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Stats />
        </ProtectedRoute>
      ),
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/auth/callback',
      element: <Loading />,
    },
    {
      path: '/dashboard',
      element: <Navigate to="/" replace />,
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
  ]);
}

