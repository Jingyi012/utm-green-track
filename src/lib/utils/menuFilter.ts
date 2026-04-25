import { AppMenuItem } from '@/lib/config/menu';

/**
 * Filter menu items based on user permissions
 * @param items Menu items to filter
 * @param userPermissions User's permissions
 * @returns Filtered menu items
 */
export const filterMenuByPermissions = (
  items: AppMenuItem[],
  userPermissions?: string[],
): AppMenuItem[] => {
  return items
    .filter((item) => {
      // Hide menu items marked as hidden
      if (item.hideInMenu) {
        return false;
      }

      // Check permission-based access
      // If a permission is required, user must have it
      if (item.requiredPermission && userPermissions && !item.showInMenuWithoutPermission) {
        const hasPermission = userPermissions.includes(item.requiredPermission);
        if (!hasPermission) {
          return false;
        }
      }

      return true;
    })
    .map((item) => ({
      ...item,
      // Recursively filter children
      children: item.children ? filterMenuByPermissions(item.children, userPermissions) : undefined,
    }));
};
