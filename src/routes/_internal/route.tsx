import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import InternalLayout from '@/components/layouts/InternalLayout';
import { getStoredUser } from '@/lib/auth/session';

export const Route = createFileRoute('/_internal')({
  beforeLoad: ({ location }) => {
    if (getStoredUser()) {
      return;
    }

    const redirectTo = `${location.pathname}${location.searchStr}${location.hash}`;

    throw redirect({
      href: `/login?redirect=${encodeURIComponent(redirectTo)}`,
      replace: true,
    });
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
