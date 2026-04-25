import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router';
import WasteRecordApproval from '@/components/wasteRecords/WasteRecordApproval';

const WasteDataApprovalRoute: React.FC = () => {
  const pathname = useLocation({ select: (location) => location.pathname });

  if (pathname === '/waste-data/approval') {
    return <WasteRecordApproval />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_internal/waste-data/approval')({
  component: WasteDataApprovalRoute,
});
