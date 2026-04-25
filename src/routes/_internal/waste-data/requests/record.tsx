import { createFileRoute } from '@tanstack/react-router';
import WasteRecordDetailPage from '@/components/wasteRecords/WasteRecordDetailPage';

export const Route = createFileRoute('/_internal/waste-data/requests/record')({
  component: () => <WasteRecordDetailPage source="requests" />,
});
