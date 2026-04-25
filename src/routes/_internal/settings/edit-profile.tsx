import { createFileRoute } from '@tanstack/react-router';
import EditProfileForm from '@/components/settings/EditProfileForm';

export const Route = createFileRoute('/_internal/settings/edit-profile')({
  component: EditProfileForm,
});
