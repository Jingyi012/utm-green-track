import { profileMenuItems, proLayoutMenuData } from '@/lib/config/menu';
import { ProLayout } from '@ant-design/pro-components';
import { Dropdown, Avatar } from 'antd';
import { NotificationBell } from '../notification/NotificationBell';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { filterMenuByPermissions } from '@/lib/utils/menuFilter';

interface AppProLayoutProps {
  children: React.ReactNode;
}

export const AppProLayout: React.FC<AppProLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, permissions } = useAuth();

  const initials = user?.userName ? user.userName[0].toUpperCase() : 'U';

  // Filter menu based on user permissions
  const filteredMenu = useMemo(() => {
    return filterMenuByPermissions(proLayoutMenuData, permissions);
  }, [permissions]);

  const handleProfileClick = async ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    } else {
      router.push(key);
    }
  };

  return (
    <>
      <style jsx global>{`
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
            <Image src="/images/logo2.png" alt="Logo" fill className="object-contain" />
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
                onClick={() => router.push(route.path || '/')}
              >
                {route.title}
              </span>
            );
          },
        }}
        menuItemRender={(item, dom) =>
          item.path ? (
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.path!);
              }}
              className="cursor-pointer w-full h-full flex items-center gap-2"
            >
              {dom}
            </a>
          ) : (
            dom
          )
        }
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
