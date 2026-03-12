import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  isDefault: boolean;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}


interface UserContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🔄 Restore session on refresh
  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);

    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    sessionStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
