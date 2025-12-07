import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/auth';
import { cookieService } from '../services/cookies';

export default function Loading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle OAuth error
      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      // Handle OAuth success with code
      if (code) {
        try {
          const response = await authService.googleCallback(code);
          
              if (response.success && response.token) {
                cookieService.setToken(response.token, true);
                toast.success('Login successful!');
                navigate('/');
          } else {
            toast.error('Authentication failed');
            navigate('/login');
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Authentication failed';
          toast.error(message);
          navigate('/login');
        }
      } else {
        // No code or error, redirect to login
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in</p>

        {/* Animated Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

