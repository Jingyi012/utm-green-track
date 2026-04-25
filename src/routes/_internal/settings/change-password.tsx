import { createFileRoute } from '@tanstack/react-router';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';

export const Route = createFileRoute('/_internal/settings/change-password')({
  component: ChangePasswordForm,
});
