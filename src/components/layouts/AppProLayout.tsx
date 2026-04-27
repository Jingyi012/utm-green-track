import { profileMenuItems, proLayoutMenuData } from '@/lib/config/menu';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, Avatar, Badge } from 'antd';
import { NotificationBell } from '../notification/NotificationBell';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { filterMenuByPermissions } from '@/lib/utils/menuFilter';
import { getAllEnquiry } from '@/lib/services/enquiry';
import { getAllRequest } from '@/lib/services/requestService';
import { getAllUsers } from '@/lib/services/user';
import { getWasteRecordsPaginated } from '@/lib/services/wasteRecord';
import { EnquiryStatus, RequestStatus, UserStatus, WasteRecordStatus } from '@/lib/enum/status';
import { PERMISSIONS } from '@/lib/utils/permissions';
import { useBadgeRefreshSetter } from '@/contexts/BadgeContext';
import { AppMenuItem } from '@/lib/config/menu';

interface AppProLayoutProps {
  children: React.ReactNode;
}

export const AppProLayout: React.FC<AppProLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { user, logout, permissions } = useAuth();
  const [menuBadgeCounts, setMenuBadgeCounts] = useState<Record<string, number>>({});
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const refreshFunctionRef = useRef<((paths?: string[]) => Promise<void>) | null>(null);
  const setBadgeRefreshFunction = useBadgeRefreshSetter();

  const initials = user?.userName ? user.userName[0].toUpperCase() : 'U';
  const canManageAdminItems = permissions.includes(PERMISSIONS.ADMIN_OPERATION.WRITE);

  // Filter menu based on user permissions
  const filteredMenu = useMemo(() => {
    return filterMenuByPermissions(proLayoutMenuData, permissions);
  }, [permissions]);

  // Helper function to get all paths in a menu tree for a parent path
  const getChildPaths = useCallback((parentPath: string, menuItems: AppMenuItem[]): string[] => {
    const paths: string[] = [];
    const traverse = (items: AppMenuItem[], currentParentPath: string) => {
      for (const item of items) {
        if (item.path?.startsWith(parentPath + '/')) {
          paths.push(item.path);
        }
        if (item.children) {
          traverse(item.children, item.path || '');
        }
      }
    };
    traverse(menuItems, parentPath);
    return paths;
  }, []);

  // Calculate parent badge counts from children
  const getParentBadgeCount = useCallback(
    (parentPath: string): number => {
      const childPaths = getChildPaths(parentPath, filteredMenu);
      return childPaths.reduce((sum, path) => sum + (menuBadgeCounts[path] ?? 0), 0);
    },
    [menuBadgeCounts, filteredMenu, getChildPaths],
  );

  const loadMenuBadgeCounts = useCallback(async () => {
    const nextCounts: Record<string, number> = {};

    const enquiryPromise = getAllEnquiry({
      pageNumber: 1,
      pageSize: 1,
      status: EnquiryStatus.Open,
    });

    const adminPromises = canManageAdminItems
      ? Promise.all([
          getAllRequest({ pageNumber: 1, pageSize: 1, status: RequestStatus.Pending }),
          getWasteRecordsPaginated({
            pageNumber: 1,
            pageSize: 1,
            status: WasteRecordStatus.New,
            isAdmin: true,
          }),
          getAllUsers({ pageNumber: 1, pageSize: 1, status: UserStatus.Pending }),
        ])
      : null;

    try {
      const enquiryResult = await enquiryPromise;
      nextCounts['/enquiry'] = enquiryResult.totalCount ?? 0;

      if (adminPromises) {
        const [requestResult, wasteApprovalResult, userApprovalResult] = await adminPromises;
        nextCounts['/waste-data/requests'] = requestResult.totalCount ?? 0;
        nextCounts['/waste-data/approval'] = wasteApprovalResult.totalCount ?? 0;
        nextCounts['/users/approval'] = userApprovalResult.totalCount ?? 0;
      }
    } catch {
      // Keep the previous badges if a transient request fails.
    }

    setMenuBadgeCounts((prev) => ({ ...prev, ...nextCounts }));
  }, [canManageAdminItems]);

  // Expose the refresh function via ref (to be used by context)
  const createRefreshFunction = useCallback(
    async (paths?: string[]) => {
      if (paths && paths.length > 0) {
        // Selective refresh - only refresh specified paths
        const pathsToRefresh = new Set(paths);
        const nextCounts: Record<string, number> = {};
        let needsRefresh = false;

        // Check if any of the paths need refreshing
        if (pathsToRefresh.has('/waste-data/requests')) {
          needsRefresh = true;
        }
        if (pathsToRefresh.has('/waste-data/approval')) {
          needsRefresh = true;
        }
        if (pathsToRefresh.has('/users/approval')) {
          needsRefresh = true;
        }
        if (pathsToRefresh.has('/enquiry')) {
          needsRefresh = true;
        }

        if (!needsRefresh) return;

        // Perform full badge load since we need admin data
        await loadMenuBadgeCounts();
      } else {
        // Full refresh
        await loadMenuBadgeCounts();
      }
    },
    [loadMenuBadgeCounts],
  );

  // Update the ref whenever the function changes
  useEffect(() => {
    refreshFunctionRef.current = createRefreshFunction;
  }, [createRefreshFunction]);

  useEffect(() => {
    if (!user) {
      setMenuBadgeCounts({});
      return;
    }

    let isMounted = true;

    const loadInitial = async () => {
      await loadMenuBadgeCounts();
    };

    loadInitial().catch(() => {
      // Silently fail
    });

    // Set up polling interval
    intervalIdRef.current = setInterval(() => {
      loadMenuBadgeCounts().catch(() => {
        // Silently fail
      });
    }, 60000);

    return () => {
      isMounted = false;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [canManageAdminItems, user, loadMenuBadgeCounts]);

  // Register refresh function with context
  useEffect(() => {
    if (refreshFunctionRef.current) {
      setBadgeRefreshFunction(refreshFunctionRef.current);
    }
  }, [setBadgeRefreshFunction]);

  const handleProfileClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else {
      await navigate({ href: key });
    }
  };

  const renderMenuContent = useCallback(
    (item: AppMenuItem, dom: React.ReactNode) => {
      // 1. Get direct count for this specific path
      const badgeCount = item.path ? (menuBadgeCounts[item.path] ?? 0) : 0;

      // 2. Get aggregate count if this is a parent (has children)
      // We pass the item's path to our existing aggregation function
      const parentBadgeCount = item.children ? getParentBadgeCount(item.path) : 0;

      const displayBadgeCount = badgeCount || parentBadgeCount;

      if (displayBadgeCount > 0) {
        return (
          <div className="w-full flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2">{dom}</span>
            <Badge
              count={displayBadgeCount}
              color="#ff4d4f"
              overflowCount={99}
              size="small"
              style={{ boxShadow: 'none' }}
            />
          </div>
        );
      }
      return dom;
    },
    [menuBadgeCounts, getParentBadgeCount],
  );

  return (
    <>
      <style>{`
        .ant-pro-layout-header,
        .ant-layout-header {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #059669 100%) !important;
        }
        .ant-pro-global-header-logo,
        .ant-pro-sider-logo {
          background: transparent !important;
        }
      `}</style>

      <ProLayout
        title="UTM Green Track"
        logo={
          <div className="relative h-8 w-8">
            <img src="/images/logo2.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
        }
        layout="mix"
        splitMenus={false}
        fixedHeader
        fixSiderbar
        location={{ pathname }}
        route={{ routes: filteredMenu }}
        breadcrumbProps={{
          minLength: 1,
          itemRender: (route, params, routes) => {
            const last = routes.indexOf(route) === routes.length - 1;
            if (last) {
              return <span color="gray">{route.title}</span>;
            }

            return (
              <span
                className="cursor-pointer hover:text-green-600 transition-colors"
                onClick={() => void navigate({ href: route.path || '/' })}
              >
                {route.title}
              </span>
            );
          },
        }}
        menuItemRender={(item, dom) => {
          const menuContent = renderMenuContent(item, dom);

          if (item.path && !item.children) {
            return (
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  void navigate({ href: item.path! });
                }}
                className="cursor-pointer w-full h-full flex items-center gap-2"
              >
                {menuContent}
              </a>
            );
          }
          return menuContent;
        }}
        subMenuItemRender={(item, dom) => {
          return renderMenuContent(item, dom);
        }}
        token={{
          header: {
            colorBgHeader: 'transparent',
            colorTextRightActionsItem: 'white',
            colorTextMenu: 'white',
            colorHeaderTitle: 'white',
            colorBgMenuItemHover: 'rgba(255,255,255,0.1)',
          },
          sider: {
            colorMenuBackground: '#fff',
            colorTextMenu: '#595959',
            colorTextMenuSelected: '#16a34a',
            colorBgMenuItemSelected: '#f6ffed',
          },
        }}
        siderMenuType="sub"
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            <NotificationBell key="bell" />,
            <Dropdown
              key="profile"
              menu={{ items: profileMenuItems, onClick: handleProfileClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-3 cursor-pointer px-2 py-1 rounded-md hover:bg-white/10 transition-colors">
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: '#0f6448',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {initials}
                </Avatar>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-white/80 text-[10px] uppercase font-semibold tracking-wide">
                    Welcome
                  </span>
                  <span className="text-white font-medium text-sm mt-0.5">
                    {user?.userName || 'User'}
                  </span>
                </div>
              </div>
            </Dropdown>,
          ];
        }}
      >
        {children}
      </ProLayout>
    </>
  );
};
