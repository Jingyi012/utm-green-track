'use client';

import { ConfigProvider } from 'antd';
import { ProConfigProvider, enUSIntl } from '@ant-design/pro-components';
import { AuthProvider } from '@/contexts/AuthContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider locale={enUSIntl}
                theme={{
                    token: {
                        colorPrimary: '#2c661f',
                        colorPrimaryHover: '#388426', // Slightly lighter for hover state
                        colorPrimaryActive: '#1e4b14', // Darker for active state
                        colorBgContainer: '#ffffffff', // Neutral light background
                        colorText: '#1a1a1a', // Dark gray text
                        colorTextSecondary: '#4d4d4d', // Medium gray for secondary text
                        colorBorder: '#d9d9d9', // Light border color
                        borderRadius: 6, // Slightly rounded corners
                        fontSize: 14, // Base font size
                    },
                    components: {
                        Menu: {
                            itemActiveBg: '#c8edb8',
                            itemSelectedBg: '#c8edb8'
                        },
                    }
                }}
            >
                <ProConfigProvider intl={enUSIntl}>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ProConfigProvider>
            </ConfigProvider>
        </AntdRegistry>
    );
}
