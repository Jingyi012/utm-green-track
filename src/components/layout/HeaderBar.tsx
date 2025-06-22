'use client';

import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { profileMenuItems } from '@/lib/config/menu';
import Image from 'next/image';

const { Header } = Layout;

export default function HeaderBar() {
    return (
        <Header
            style={{
                background: '#2c661f',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Image src={'/images/logo2.png'} alt="Logo" height={50} width={50} />
            </div>
            <Dropdown
                menu={{ items: profileMenuItems }}
                trigger={['click']}
                placement="bottomRight"
            >
                <Avatar style={{ cursor: 'pointer' }} size="large" icon={<UserOutlined />} />
            </Dropdown>
        </Header>
    );
}
