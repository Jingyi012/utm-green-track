import { createFileRoute } from '@tanstack/react-router';
import NotificationList from '@/components/notification/NotificationList';

export const Route = createFileRoute('/_internal/notifications')({
  component: NotificationList,
});
