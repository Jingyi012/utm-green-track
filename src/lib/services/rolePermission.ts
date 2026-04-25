import { GeneralResponse } from '../types/apiResponse';
import api from '../utils/axios';
import type { AxiosRequestConfig } from 'axios';

const API_URL = '/api/roles';

export interface AvailablePermission {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
}

/**
 * Fetch all available permissions in the system
 */
export async function getAvailablePermissions(options?: AxiosRequestConfig) {
  return api.get<GeneralResponse<AvailablePermission[]>>(`${API_URL}/permissions/available`, {
    ...options,
  });
}

/**
 * Fetch all roles (excluding admin if parameter is true)
 */
export async function getAllRoles(options?: AxiosRequestConfig) {
  return api.get<GeneralResponse<Role[]>>(`${API_URL}`, { ...options });
}

/**
 * Fetch permissions for a specific role
 */
export async function getRolePermissions(roleId: string, options?: AxiosRequestConfig) {
  return api.get<GeneralResponse<string[]>>(`${API_URL}/${roleId}/permissions`, { ...options });
}

/**
 * Update permissions for a specific role
 */
export async function updateRolePermissions(
  roleId: string,
  permissions: string[],
  options?: AxiosRequestConfig,
) {
  return api.put<GeneralResponse<void>>(`${API_URL}/${roleId}/permissions`, permissions, {
    ...options,
  });
}
