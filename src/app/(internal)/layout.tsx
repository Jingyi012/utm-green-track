'use client';

import { Avatar, Dropdown, Layout, Menu, MenuProps, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { menuItems, profileMenuItems } from '@/lib/config/menu';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

type UserInfo = {
    name?: string;
    [key: string]: any;
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth()

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'logout') {
            try {
                await logout();
            } catch (err) {
                message.error('Logout failed!');
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            refreshAuth();
        }, 55 * 60 * 1000); // 55 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <ProtectedRoute>
            <Layout style={{ minHeight: '100vh' }}>
                {/* Header with Collapse Button */}
                <Header style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    width: '100%',
                    background: '#2c661f',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 64,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Collapse Button */}
                        <div
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '20px',
                                marginRight: '16px'
                            }}
                        >
                            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        </div>

                        <Image src="/images/logo2.png" alt="Logo" height={40} width={40} />

                    </div>

                    <Dropdown
                        menu={{ items: profileMenuItems, onClick: handleMenuClick }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 8 }}>
                                <span style={{ color: 'white', lineHeight: 1 }}>Welcome</span>
                                <span style={{ color: 'white', fontWeight: 500, lineHeight: 1.5 }}>{user?.name || 'User'}</span>
                            </div>
                            <Avatar size="large" icon={<UserOutlined />} />
                        </div>
                    </Dropdown>
                </Header>

                <Layout style={{ marginTop: 64 }}>
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        trigger={null}
                        width={200}
                        collapsedWidth={80}
                        style={{
                            position: 'fixed',
                            height: 'calc(100vh - 64px)',
                            left: 0,
                            top: 64,
                            zIndex: 100,
                            backgroundColor: '#fff',
                            overflow: 'auto',
                        }}
                    >
                        <Menu
                            theme="light"
                            mode="inline"
                            defaultOpenKeys={['/data-entry', '/settings']}
                            selectedKeys={[pathname]}
                            items={menuItems}
                            onClick={({ key }) => router.push(key)}
                            style={{ backgroundColor: '#fff', height: '100%' }}
                            inlineCollapsed={collapsed}
                        />
                    </Sider>

                    {/* Content */}
                    <Content
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            padding: 24,
                            minHeight: 'calc(100vh - 64px)',
                            background: '#fff',
                            transition: 'margin-left 0.2s ease',
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </ProtectedRoute>
    );
}

function refreshAuth() {
    throw new Error('Function not implemented.');
}
