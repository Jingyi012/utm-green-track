'use client';

import { Avatar, Button, Dropdown, Layout, Menu, MenuProps, theme } from 'antd';
import React, { useState } from 'react';
import { AppMenuItem, menuItems, profileMenuItems } from '@/lib/config/menu';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import PageGuard from '@/components/routes/PageGuard';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorPrimary },
    } = theme.useToken();

    const router = useRouter();
    const pathname = usePathname();

    const { user, logout } = useAuth();

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'logout') {
            await logout(); // clear session
            router.replace('/login');
        }
    };

    const initials = user?.userName
        ? user.userName[0].toUpperCase()
        : 'U';

    function filterMenuByRole(items: AppMenuItem[], userRoles?: string[]): AppMenuItem[] {
        return items
            .filter(item => {
                if (!item.roles || !userRoles) return true;
                return item.roles.some(role => userRoles.includes(role));
            })
            .map(item => {
                if ("children" in item && item.children) {
                    const filteredChildren = filterMenuByRole(item.children, userRoles);

                    if (filteredChildren.length > 0) {
                        return { ...item, children: filteredChildren } as AppMenuItem;
                    }

                    const { children, ...rest } = item;
                    return rest as AppMenuItem;
                }

                return item as AppMenuItem;
            });
    }

    const findParentKey = (items: any[], path: string): string | undefined => {
        for (const item of items) {
            if (item.children?.some((child: any) => path.startsWith(child.key))) {
                return item.key as string;
            }
        }
        return undefined;
    };

    const parentKey = findParentKey(menuItems, pathname);

    return (
        <PageGuard>
            <Layout style={{ minHeight: '100vh' }}>
                {/* Sidebar */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    theme='light'
                    breakpoint="lg"
                    collapsedWidth="0"
                    style={{
                        position: 'sticky',
                        height: '100vh',
                        top: 0,
                        bottom: 0,
                        scrollbarWidth: 'thin',
                        scrollbarGutter: 'stable',
                    }}
                >
                    <div className='h-[44px] m-[10px] flex justify-center items-center'>
                        <div className='flex justify-center items-center'>
                            <Image src="/images/logo2.png" alt="Logo" height={40} width={40} />
                            <span style={{ fontWeight: 'bold', color: colorPrimary }}>UTM Green Track</span>
                        </div>
                    </div>

                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[pathname]}
                        defaultOpenKeys={parentKey ? [parentKey] : []}
                        items={filterMenuByRole(menuItems, user?.roles)}
                        onClick={({ key }) => router.push(key)}
                        inlineCollapsed={collapsed}
                    />
                </Sider>

                {/* Main */}
                <Layout>
                    <Header
                        style={{
                            padding: '0',
                            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #059669 100%)',
                            display: 'flex',
                            justifyContent: "space-between",
                            position: 'sticky',
                            top: 0,
                            zIndex: '1000'
                        }}
                    >
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                color: 'white',
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />

                        <Dropdown
                            menu={{ items: profileMenuItems, onClick: handleMenuClick }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <div className="flex items-center gap-2 cursor-pointer mr-[24px]">
                                <div className="flex flex-col items-end mr-2">
                                    <span className="text-white text-xs leading-none">Welcome</span>
                                    <span className="text-white font-medium leading-snug">
                                        {user?.userName || 'User'}
                                    </span>
                                </div>
                                <Avatar size="large" style={{ backgroundColor: '#0f6448ff' }}>
                                    {initials}
                                </Avatar>
                            </div>
                        </Dropdown>
                    </Header>

                    {/* Content */}
                    <Content style={{ margin: '16px 24px' }}>
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </PageGuard>
    );
}
