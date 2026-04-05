import { APP_PERMISSIONS, proLayoutMenuData, type AppMenuItem } from '@/lib/config/menu';

export interface PageAccessRequirement {
  requiredPermission?: string;
}

const normalizePath = (path: string): string => {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
};

const buildPagePermissionMap = (
  items: AppMenuItem[],
  inheritedPermission?: string,
): Record<string, PageAccessRequirement> => {
  const map: Record<string, PageAccessRequirement> = {};

  for (const item of items) {
    const requiredPermission = item.requiredPermission ?? inheritedPermission;
    map[normalizePath(item.path)] = { requiredPermission };

    if (item.children?.length) {
      Object.assign(map, buildPagePermissionMap(item.children, requiredPermission));
    }
  }

  return map;
};

export const PAGE_ACCESS_MAP = buildPagePermissionMap(proLayoutMenuData);
export const PAGE_PERMISSION_MAP: Record<string, string | undefined> = Object.fromEntries(
  Object.entries(PAGE_ACCESS_MAP).map(([path, access]) => [path, access.requiredPermission]),
);

export const canAccessPage = (
  pagePath: string,
  userPermissions: string[],
): boolean => {
  const access = PAGE_ACCESS_MAP[normalizePath(pagePath)];
  if (!access) {
    return true;
  }

  const requiredPermission = access.requiredPermission;
  if (!requiredPermission) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
};

export const getPageAccessRequirement = (pagePath: string): PageAccessRequirement => {
  return PAGE_ACCESS_MAP[normalizePath(pagePath)] ?? {};
};

export const getPagePermissionRequirement = (pagePath: string): string | undefined => {
  return getPageAccessRequirement(pagePath).requiredPermission;
};

export const canPerformAction = (
  permissions: string[],
  resource: string,
  action: string,
): boolean => {
  const requiredPermission = `Permissions.${resource}.${action}`;
  return permissions.includes(requiredPermission);
};

export const PERMISSIONS = APP_PERMISSIONS;
