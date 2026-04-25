import { createFileRoute } from '@tanstack/react-router';
import WasteRecordDetailPage from '@/components/wasteRecords/WasteRecordDetailPage';

export const Route = createFileRoute('/_internal/waste-data/management/record')({
  component: () => <WasteRecordDetailPage source="management" />,
});
