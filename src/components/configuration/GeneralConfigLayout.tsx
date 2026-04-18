
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { LandfillingCostConfig, UtmPopulationConfig } from './GeneralConfig';
import { DepartmentConfig } from './DepartmentConfig';
import DisposalWasteConfig from './DisposalWasteConfig';
import RolePermissions from './RolePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/lib/utils/permissions';

export const GeneralConfigLayout: React.FC = () => {
  const { hasPermission } = useAuth();
  const canManageRolePermissions = hasPermission(PERMISSIONS.ADMIN_OPERATION.WRITE);

  const items: TabsProps['items'] = [
    {
      key: 'landfilling-cost',
      label: 'Landfilling Cost',
      children: <LandfillingCostConfig />,
    },
    {
      key: 'utm-population',
      label: 'UTM Population',
      children: <UtmPopulationConfig />,
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

  if (canManageRolePermissions) {
    items.push({
      key: 'role-permissions',
      label: 'Role Permissions',
      children: <RolePermissions />,
    });
  }

  return (
    <PageContainer title="Configurations" style={{ minHeight: '500px' }}>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Tabs
          defaultActiveKey="landfilling-cost"
          items={items}
          tabPosition="left"
          style={{ minHeight: '400px' }}
        />
      </div>
    </PageContainer>
  );
};

