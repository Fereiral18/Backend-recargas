import { createContext, useState, ReactNode } from 'react';

interface User {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'reseller' | 'admin';
  status: string;
  balance: number;
}

interface Context {
  userInfo: User | null;
  setUserInfo: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<Context>({
  userInfo: null,
  setUserInfo: () => console.log('AuthContext not initialized'),
  isAuthenticated: false,
  logout: () => {},
  checkAuth: () => false,
});

// Lee el estado inicial de localStorage de forma síncrona (no en un
// useEffect). Si se hace en un efecto, el primer render siempre arranca con
// isAuthenticated=false — y ProtectedRoute, que se renderiza en esa misma
// pasada, alcanza a redirigir a /login antes de que el efecto corrija el
// estado. Eso pasaba desapercibido navegando dentro de la app (nunca se
// remonta AuthProvider), pero explotaba cada vez que el navegador hacía una
// recarga completa de página — exactamente lo que pasa al volver de
// Mercado Pago — expulsando a un usuario con sesión perfectamente válida.
const readStoredUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const hasStoredSession = (): boolean =>
  Boolean(localStorage.getItem('access_token')) && Boolean(localStorage.getItem('user'));

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userInfo, setUserInfoState] = useState<User | null>(() => readStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasStoredSession());

  const setUserInfo = (user: User | null) => {
    setUserInfoState(user);
    setIsAuthenticated(!!user);
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setUserInfoState(null);
      setIsAuthenticated(false);
      return false;
    }

    return true;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    setUserInfoState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        setUserInfo,
        isAuthenticated,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};