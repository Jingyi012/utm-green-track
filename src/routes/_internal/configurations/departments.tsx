import { createFileRoute } from '@tanstack/react-router';
import { DepartmentConfig } from '@/components/configuration/DepartmentConfig';

export const Route = createFileRoute('/_internal/configurations/departments')({
  component: DepartmentConfig,
});
