import { createFileRoute } from '@tanstack/react-router';
import UserManagement from '@/components/users/UserManagement';

export const Route = createFileRoute('/_internal/users/management')({
  component: UserManagement,
});
