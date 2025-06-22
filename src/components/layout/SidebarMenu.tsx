'use client';

import { Menu, Layout } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { menuItems } from '@/lib/config/menu';

const { Sider } = Layout;

export default function SidebarMenu() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            style={{ backgroundColor: '#ffffff' }}
        >
            <Menu
                theme="light"
                mode="inline"
                defaultOpenKeys={['/data-entry']}
                selectedKeys={[pathname]}
                items={menuItems}
                onClick={({ key }) => router.push(key)}
                style={{ backgroundColor: '#ffffff' }}
            />
        </Sider>
    );
}
