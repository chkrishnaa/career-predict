import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would check if user is authenticated
    // For example, check local storage, cookies, or make an API call
    const checkAuth = async () => {
      try {
        // Placeholder for actual authentication logic
        const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(isLoggedIn);
        
        if (isLoggedIn) {
          // Placeholder for actual user data retrieval
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    // Placeholder for actual login logic
    setLoading(true);
    try {
      // Simulating login success
      localStorage.setItem('isAuthenticated', 'true');
      const userData = { email: credentials.email };
      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
}; 