import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';
import RequestManagement from '@/components/request/RequestManagement';

const WasteDataRequestsRoute: React.FC = () => {
  const pathname = useLocation({ select: (location) => location.pathname });

  if (pathname === '/waste-data/requests') {
    return <RequestManagement />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_internal/waste-data/requests')({
  component: WasteDataRequestsRoute,
});
