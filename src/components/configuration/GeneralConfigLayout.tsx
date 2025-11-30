'use client';

import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { GeneralConfig } from './GeneralConfig';
import { DepartmentConfig } from './DepartmentConfig';
import DisposalWasteConfig from './DisposalWasteConfig';

export const GeneralConfigLayout: React.FC = () => {
    const items: TabsProps['items'] = [
        {
            key: 'general',
            label: 'General Config',
            children: <GeneralConfig />,
        },
        {
            key: 'waste',
            label: 'Disposal/Waste Types',
            children: <DisposalWasteConfig />,
        },
        {
            key: 'department',
            label: 'Departments',
            children: <DepartmentConfig />,
        },
    ];

    return (
        <PageContainer title="Configurations" style={{ minHeight: '500px' }}>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <Tabs
                    defaultActiveKey="general"
                    items={items}
                    tabPosition="left"
                    style={{ minHeight: '400px' }}
                />
            </div>
        </PageContainer>
    );
};
