import useSWR, { mutate as mutateCache } from 'swr';
import {
  getAllRoles,
  getAvailablePermissions,
  getRolePermissions,
  updateRolePermissions,
  type AvailablePermission,
  type Role,
} from '@/lib/services/rolePermission';
import { useCallback, useState } from 'react';

const ROLE_PERMISSION_METADATA_KEY = 'role-permission-metadata';
const rolePermissionKey = (roleId: string) => `role-permissions-${roleId}`;

type RolePermissionMetadata = {
  roles: Role[];
  availablePermissions: AvailablePermission[];
};

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
  const { data, error, isLoading, mutate } = useSWR<RolePermissionMetadata>(
    ROLE_PERMISSION_METADATA_KEY,
    fetchRolePermissionMetadata,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 10,
    },
  );

  return {
    roles: data?.roles ?? [],
    availablePermissions: data?.availablePermissions ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useRolePermissions(roleId?: string) {
  const {
    data: rolePermissions,
    error,
    isLoading,
    mutate,
  } = useSWR<string[]>(roleId ? rolePermissionKey(roleId) : null, () => fetchRolePermissions(roleId!), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000 * 60 * 5,
  });

  return {
    rolePermissions: rolePermissions ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useUpdateRolePermissions() {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const saveRolePermissions = useCallback(async (roleId: string, permissions: string[]) => {
    try {
      setIsSaving(true);
      await updateRolePermissions(roleId, permissions);
      await Promise.all([
        mutateCache(rolePermissionKey(roleId)),
        mutateCache(ROLE_PERMISSION_METADATA_KEY),
      ]);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    saveRolePermissions,
  };
}
