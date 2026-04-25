import { createFileRoute } from '@tanstack/react-router';
import UserApproval from '@/components/users/UserApproval';

export const Route = createFileRoute('/_internal/users/approval')({
  component: UserApproval,
});
