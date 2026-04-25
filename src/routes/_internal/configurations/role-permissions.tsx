import { createFileRoute } from '@tanstack/react-router';
import RolePermissions from '@/components/configuration/RolePermissions';

export const Route = createFileRoute('/_internal/configurations/role-permissions')({
  component: RolePermissions,
});
