'use client';

import { Avatar, Button, Dropdown, Layout, Menu, MenuProps, message, theme } from 'antd';
import React, { useState } from 'react';
import { menuItems, profileMenuItems } from '@/lib/config/menu';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { signOut, useSession } from 'next-auth/react';

const { Header, Sider, Content } = Layout;

type UserInfo = {
    name?: string;
    [key: string]: any;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorPrimary, colorBgContainer },
    } = theme.useToken();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'logout') {
            try {
                await signOut({ callbackUrl: '/auth/login' });
            } catch (err) {
                message.error('Logout failed!');
            }
        }
    };

    const initials = user?.name
        ? user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'US';

    return (
        <ProtectedRoute>
            <Layout style={{ minHeight: '100vh' }}>
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
                        defaultOpenKeys={['/data-entry', '/settings']}
                        selectedKeys={[pathname]}
                        items={menuItems}
                        onClick={({ key }) => router.push(key)}
                        inlineCollapsed={collapsed}
                    />
                </Sider>
                <Layout>
                    <Header style={{
                        padding: '0',
                        background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #059669 100%)',
                        display: 'flex',
                        justifyContent: "space-between",
                        position: 'sticky',
                        top: 0,
                        zIndex: '1000'
                    }}>
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
                                    <span className="text-white font-medium leading-snug">{user?.name || 'User'}</span>
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
        </ProtectedRoute >
    );
}