import { createContext, useState, ReactNode, useEffect } from "react";

interface User {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  status: string;
  balance: number;
}

interface Context {
  userInfo: User | null;
  setUserInfo: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<Context>({
  userInfo: null,
  setUserInfo: () => console.log("AuthContext not initialized"),
  isAuthenticated: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userInfo, setUserInfoState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Cargar usuario del localStorage al montar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfoState(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        logout();
      }
    }
  }, []);

  // Wrapper para setUserInfo que también actualiza isAuthenticated
  const setUserInfo = (user: User | null) => {
    setUserInfoState(user);
    setIsAuthenticated(!!user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUserInfoState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};