'use client';

import React from 'react';
import PageGuard from '@/components/routes/PageGuard';
import { AppProLayout } from '@/components/layouts/AppProLayout';
import { ConfigProvider } from 'antd';

export default function AppLayout({ children }: { children: React.ReactNode }) {

    return (
        <PageGuard>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#16a34a',
                    },
                }}
            >
                <AppProLayout>
                    {children}
                </AppProLayout>
            </ConfigProvider>
        </PageGuard>
    );
}
