import { useNavigate } from '@tanstack/react-router';
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { clearStoredUser, getStoredUser, setStoredUser, type AuthUser } from '@/lib/auth/session';

type User = AuthUser | null;

interface AuthContextType {
  user: User;
  roles: string[];
  permissions: string[];
  isReady: boolean;
  login: (data: AuthUser) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type JwtPermissionClaims = {
  Permission?: string | string[];
};

const parsePermissionsFromToken = (token: string): string[] => {
  try {
    const decoded = jwtDecode<JwtPermissionClaims>(token);
    // JWT standard uses "Permission" claim, but can also be an array of permissions
    if (decoded.Permission) {
      if (Array.isArray(decoded.Permission)) {
        return decoded.Permission;
      }
      return [decoded.Permission];
    }
    return [];
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return [];
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const parsedUser = getStoredUser();
    if (parsedUser) {
      setUser(parsedUser);
      const perms = parsePermissionsFromToken(parsedUser.jwToken);
      setPermissions(perms);
    }
    setIsReady(true);
  }, []);

  const login = (data: AuthUser) => {
    setStoredUser(data);
    setUser(data);
    const perms = parsePermissionsFromToken(data.jwToken);
    setPermissions(perms);
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
    setPermissions([]);
    void navigate({ to: '/login', replace: true });
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const isAdmin = user?.roles?.includes('Admin') ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        roles: user?.roles ?? [],
        permissions,
        isReady,
        login,
        logout,
        hasRole,
        hasPermission,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
