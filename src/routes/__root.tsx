/// <reference types='vite/client' />
import '@ant-design/v5-patch-for-react-19';
import type { ReactNode } from 'react';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import appCss from '../styles/app.css?url';
import { AppProviders } from '@/contexts/AppProvider';
import NotFoundPage from '@/components/routes/NotFoundPage';
import RouteTransitionSpinner from '@/components/routes/RouteTransitionSpinner';
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'UTM Green Track',
      },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});
function RootComponent() {
  return (
    <RootDocument>
      <AppProviders>
        <Outlet />
        <RouteTransitionSpinner />
      </AppProviders>
    </RootDocument>
  );
}
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
