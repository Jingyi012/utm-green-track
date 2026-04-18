import {
  getAllRoles,
  getAvailablePermissions,
  getRolePermissions,
  updateRolePermissions,
  type AvailablePermission,
  type Role,
} from '@/lib/services/rolePermission';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const rolePermissionQueryKeys = {
  all: ['role-permissions'] as const,
  metadata: () => [...rolePermissionQueryKeys.all, 'metadata'] as const,
  permissions: () => [...rolePermissionQueryKeys.all, 'permissions'] as const,
  permission: (roleId: string) => [...rolePermissionQueryKeys.permissions(), roleId] as const,
} as const;

type RolePermissionMetadata = {
  roles: Role[];
  availablePermissions: AvailablePermission[];
};

const EMPTY_ROLES: Role[] = [];
const EMPTY_AVAILABLE_PERMISSIONS: AvailablePermission[] = [];
const EMPTY_ROLE_PERMISSIONS: string[] = [];

const fetchRolePermissionMetadata = async (): Promise<RolePermissionMetadata> => {
  const [permissionsResponse, rolesResponse] = await Promise.all([
    getAvailablePermissions(),
    getAllRoles(),
  ]);

  const availablePermissions = Array.isArray(permissionsResponse.data)
    ? permissionsResponse.data
    : [];
  const roles = Array.isArray(rolesResponse.data) ? rolesResponse.data : [];

  return { roles, availablePermissions };
};

const fetchRolePermissions = async (roleId: string): Promise<string[]> => {
  const response = await getRolePermissions(roleId);
  return Array.isArray(response.data) ? response.data : [];
};

export function useRolePermissionMetadata() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: rolePermissionQueryKeys.metadata(),
    queryFn: fetchRolePermissionMetadata,
    staleTime: 1000 * 60 * 10,
    throwOnError: true,
  });

  return {
    roles: data?.roles ?? EMPTY_ROLES,
    availablePermissions: data?.availablePermissions ?? EMPTY_AVAILABLE_PERMISSIONS,
    isLoading,
    error,
    refetch,
  };
}

export function useRolePermissions(roleId?: string) {
  const {
    data: rolePermissions,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: rolePermissionQueryKeys.permission(roleId ?? ''),
    queryFn: () => fetchRolePermissions(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5,
    throwOnError: true,
  });

  return {
    rolePermissions: rolePermissions ?? EMPTY_ROLE_PERMISSIONS,
    isLoading,
    error,
    refetch,
  };
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      await updateRolePermissions(roleId, permissions);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: rolePermissionQueryKeys.permission(variables.roleId),
        }),
        queryClient.invalidateQueries({ queryKey: rolePermissionQueryKeys.metadata() }),
      ]);
    },
  });

  return {
    isSaving: mutation.isPending,
    saveRolePermissions: async (roleId: string, permissions: string[]) =>
      mutation.mutateAsync({ roleId, permissions }),
  };
}
