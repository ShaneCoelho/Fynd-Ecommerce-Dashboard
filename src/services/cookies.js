import Cookies from 'js-cookie';

const TOKEN_KEY = 'authToken';

export const cookieService = {
  // Set token in cookie only
  setToken: (token, rememberMe = false) => {
    const options = rememberMe ? { expires: 7 } : {}; // 7 days if remember me, otherwise session cookie
    Cookies.set(TOKEN_KEY, token, options);
  },

  // Get token from cookie
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  // Remove token
  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!cookieService.getToken();
  },
};

