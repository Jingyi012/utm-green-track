import { createFileRoute } from '@tanstack/react-router';
import DataAnalyticsPage from '@/components/dataAnalytics/DataAnalyticsPage';

export const Route = createFileRoute('/_internal/data-analytics')({
  component: DataAnalyticsPage,
});
