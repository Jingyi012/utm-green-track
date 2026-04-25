/// <reference types='vite/client' />
import '@ant-design/v5-patch-for-react-19';
import { Outlet, createRootRoute } from '@tanstack/react-router';

import { AppProviders } from '@/contexts/AppProvider';
import NotFoundPage from '@/components/routes/NotFoundPage';
import RouteTransitionSpinner from '@/components/routes/RouteTransitionSpinner';

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});

function RootComponent() {
  return (
    <AppProviders>
      <Outlet />
      <RouteTransitionSpinner />
    </AppProviders>
  );
}
