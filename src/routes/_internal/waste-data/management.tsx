import { createFileRoute } from '@tanstack/react-router';
import WasteRecordManagement from '@/components/wasteRecords/WasteRecordManagement';

export const Route = createFileRoute('/_internal/waste-data/management')({
  component: WasteRecordManagement,
});
