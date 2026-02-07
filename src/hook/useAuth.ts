import { useState, useEffect } from 'react';

interface AuthUser {
  email: string;
  name: string;
  token: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const authToken = sessionStorage.getItem('authToken');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');

    if (authToken && userEmail && userName) {
      setIsAuthenticated(true);
      setUser({
        email: userEmail,
        name: userName,
        token: authToken,
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = (email: string, name: string) => {
    const authToken = btoa(`${email}:${Date.now()}`);
    sessionStorage.setItem('authToken', authToken);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userName', name);
    
    setIsAuthenticated(true);
    setUser({
      email,
      name,
      token: authToken,
    });
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
  };
};