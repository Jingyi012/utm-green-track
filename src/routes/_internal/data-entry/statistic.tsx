import { createFileRoute } from '@tanstack/react-router';
import WasteManagementTable from '@/components/dataEntry/statistic/Statistic';

export const Route = createFileRoute('/_internal/data-entry/statistic')({
  component: WasteManagementTable,
});
