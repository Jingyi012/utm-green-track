import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import InternalLayout from '@/components/layouts/InternalLayout';
import {
  clearStoredUser,
  getStoredUser,
  isTokenExpired,
  setStoredUser,
  notifyTokenUpdated,
} from '@/lib/auth/session';
import api from '@/lib/utils/axios';

const API_URL = '/api/auth';

export const Route = createFileRoute('/_internal')({
  beforeLoad: async ({ location }) => {
    const user = getStoredUser();
    const redirectTo = `${location.pathname}${location.searchStr}${location.hash}`;

    // No user found, redirect to login
    if (!user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectTo)}`;
      throw redirect({
        href: loginUrl,
        replace: true,
      });
    }

    // User exists, check if token is expired
    if (isTokenExpired(user.jwToken)) {
      try {
        // Call refresh endpoint directly with a custom header to tell the
        // axios interceptor NOT to handle 401 on this request (the route guard
        // handles redirects itself)
        const res = await api.post(
          `${API_URL}/refresh`,
          {},
          {
            headers: {
              'X-Skip-Auth-Interceptor': 'true',
            },
          },
        );

        // Extract token from response
        let newToken: string | null = null;

        if (res && typeof res === 'object') {
          if ('data' in res && typeof res.data === 'object') {
            newToken = (res.data as any)?.token;
          } else if ('token' in res) {
            newToken = (res as any).token;
          }
        }

        if (!newToken) {
          throw new Error('No token in refresh response');
        }

        // Update stored user with new token
        const updatedUser = {
          ...user,
          jwToken: newToken,
        };
        setStoredUser(updatedUser);

        // Notify AuthContext and other services about token update
        notifyTokenUpdated();

        return;
      } catch (refreshError) {
        // Clear user data since refresh failed (token + refresh token are both invalid)
        clearStoredUser();
        // Token refresh failed, redirect to login
        const loginUrl = `/login?redirect=${encodeURIComponent(redirectTo)}`;
        throw redirect({
          href: loginUrl,
          replace: true,
        });
      }
    }

    // Token is valid, allow access
    return;
  },
  component: InternalRouteLayout,
});

function InternalRouteLayout() {
  return (
    <InternalLayout>
      <Outlet />
    </InternalLayout>
  );
}
