import { createFileRoute } from '@tanstack/react-router';
import MyRequestManagement from '@/components/request/MyRequestManagement';

export const Route = createFileRoute('/_internal/data-entry/view-form/requests')({
  component: MyRequestManagement,
});
