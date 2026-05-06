import { createFileRoute } from '@tanstack/react-router';
import WasteRecordDetailPage from '@/components/wasteRecords/WasteRecordDetailPage';

export const Route = createFileRoute('/_internal/data-entry/view-form/record')({
  component: () => <WasteRecordDetailPage source="view-form" />,
});
