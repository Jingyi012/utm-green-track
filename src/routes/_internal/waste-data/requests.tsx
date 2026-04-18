import { createFileRoute } from '@tanstack/react-router';
import RequestManagement from '@/components/request/RequestManagement';

export const Route = createFileRoute('/_internal/waste-data/requests')({
  component: RequestManagement,
});
