/**
 * @deprecated
 * Query keys are now defined in individual hook files for better organization.
 *
 * Use the following instead:
 * - enquiryQueryKeys: import from '@/hook/enquiry'
 * - wasteRecordQueryKeys: import from '@/hook/wasteRecords'
 * - requestQueryKeys: import from '@/hook/requests'
 * - userQueryKeys: import from '@/hook/users'
 * - departmentQueryKeys: import from '@/hook/departments'
 * - disposalMethodQueryKeys: import from '@/hook/disposalMethods'
 * - wasteTypeQueryKeys, configQueryKeys: import from '@/hook/configurations'
 *
 * See TANSTACK_QUERY_REFACTORING.md for migration guide.
 */

export const queryKeys = {
  profileOptions: ['profile-options'] as const,
  wasteRecordOptions: ['waste-options'] as const,
  departments: ['departments'] as const,
  disposalMethods: ['disposal-methods'] as const,
  wasteTypes: ['waste-types'] as const,
  configs: (filters?: { prefix?: string; year?: number }) =>
    ['configs', filters?.prefix ?? 'all', filters?.year ?? 'all'] as const,
  configsByPrefix: (prefix: string) => ['configs', prefix] as const,
  rolePermissionMetadata: ['role-permission-metadata'] as const,
  rolePermissions: (roleId?: string) => ['role-permissions', roleId ?? ''] as const,
} as const;
