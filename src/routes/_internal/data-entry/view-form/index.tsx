import { createFileRoute } from '@tanstack/react-router';
import WasteRecordManagement from '@/components/wasteRecords/WasteRecordManagement';

export const Route = createFileRoute('/_internal/data-entry/view-form/')({
  component: WasteRecordManagement,
});
