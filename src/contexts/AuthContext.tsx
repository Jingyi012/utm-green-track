'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type User = {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  jwToken: string;
} | null;

interface AuthContextType {
  user: User;
  roles: string[];
  permissions: string[];
  login: (data: User) => void;
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
      console.log(decoded.Permission);
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
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Parse permissions from JWT token
      const perms = parsePermissionsFromToken(parsedUser.jwToken);
      setPermissions(perms);
    }
  }, []);

  const login = (data: User) => {
    if (data) {
      localStorage.setItem('currentUser', JSON.stringify(data));
      setUser(data);
      // Parse permissions from JWT token
      const perms = parsePermissionsFromToken(data.jwToken);
      setPermissions(perms);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setPermissions([]);
    router.replace('/login');
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
