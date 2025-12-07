import Login from '../pages/Login';
import Loading from '../pages/Loading';

const AuthRoutes = {
  path: '/',
  children: [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/auth/callback',
      element: <Loading />,
    },
  ],
};

export default AuthRoutes;

