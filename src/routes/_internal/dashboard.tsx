import { createFileRoute } from '@tanstack/react-router';
import DashboardSection from '@/components/dashboard/DashboardSection';

export const Route = createFileRoute('/_internal/dashboard')({
  component: DashboardSection,
});
