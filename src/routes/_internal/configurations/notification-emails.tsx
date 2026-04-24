import { createFileRoute } from '@tanstack/react-router';
import { NotificationEmailConfig } from '@/components/configuration/NotificationEmailConfig';

export const Route = createFileRoute('/_internal/configurations/notification-emails')({
  component: NotificationEmailConfig,
});
