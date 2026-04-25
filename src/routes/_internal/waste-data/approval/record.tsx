import { createFileRoute } from '@tanstack/react-router';
import WasteRecordDetailPage from '@/components/wasteRecords/WasteRecordDetailPage';

export const Route = createFileRoute('/_internal/waste-data/approval/record')({
  component: () => <WasteRecordDetailPage source="approval" />,
});
