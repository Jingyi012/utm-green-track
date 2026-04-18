import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';
import WasteRecordManagement from '@/components/wasteRecords/WasteRecordManagement';

const WasteDataManagementRoute: React.FC = () => {
  const pathname = useLocation({ select: (location) => location.pathname });

  if (pathname === '/waste-data/management') {
    return <WasteRecordManagement />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_internal/waste-data/management')({
  component: WasteDataManagementRoute,
});
