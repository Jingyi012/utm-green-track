'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import { AppProLayout } from '@/components/layouts/AppProLayout';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <AppProLayout>
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you don't have access to this page."
                extra={
                    <Button type="primary" onClick={() => router.back()}>
                        Back
                    </Button>
                }
            />
        </AppProLayout>
    );
}