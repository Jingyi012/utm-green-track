import { createFileRoute } from '@tanstack/react-router';
import WasteRecordApproval from '@/components/wasteRecords/WasteRecordApproval';

export const Route = createFileRoute('/_internal/waste-data/approval')({
  component: WasteRecordApproval,
});
