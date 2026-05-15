import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  jwToken: string;
}

export const AUTH_STORAGE_KEY = 'currentUser';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) {
      return false;
    }
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    // Add 60 second buffer to refresh before actual expiration
    return currentTime >= expirationTime - 60000;
  } catch (error) {
    return true; // Treat invalid tokens as expired
  }
}

/**
 * Check if stored user has a valid (non-expired) token
 * @returns true if user exists and token is valid, false otherwise
 */
export function hasValidToken(): boolean {
  const user = getStoredUser();
  if (!user) {
    return false;
  }
  return !isTokenExpired(user.jwToken);
}

/**
 * Notify the app that the token has been updated
 * Used by route guards and other services when token is refreshed
 */
export function notifyTokenUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:token-updated'));
  }
}
