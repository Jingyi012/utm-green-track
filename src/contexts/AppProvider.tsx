'use client';

import { App, ConfigProvider } from 'antd';
import { createIntl, ProConfigProvider } from '@ant-design/pro-components';
import enUSIntl from '@ant-design/pro-provider/lib/locale/en_US';
import enUS from "antd/locale/en_US";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from './AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
    const myTranslationMap = {
        ...enUSIntl,
        tableForm: {
            ...enUSIntl.tableForm,
            search: 'Search',
            submit: 'Submit',
            reset: 'Reset',
        },
        // You can override other sections like 'moneySymbol', 'form', etc.
    };
    const customIntl = createIntl('en_US', myTranslationMap);

    return (
        <AntdRegistry>
            <ConfigProvider locale={enUS}
                theme={{
                    token: {
                        colorPrimary: '#15803d',
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
                <ProConfigProvider intl={customIntl}>
                    <App>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </App>
                </ProConfigProvider>
            </ConfigProvider>
        </AntdRegistry>
    );
}
