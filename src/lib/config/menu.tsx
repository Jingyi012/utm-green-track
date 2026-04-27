import {
  BellOutlined,
  BulbOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MailOutlined,
  SettingOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ReactNode } from 'react';
import { GrAnalytics } from 'react-icons/gr';

export const APP_PERMISSIONS = {
  WASTE_RECORD: {
    READ: 'Permissions.WasteRecord.Read',
    WRITE: 'Permissions.WasteRecord.Write',
  },
  ADMIN_OPERATION: {
    WRITE: 'Permissions.AdminOperation.Write',
  },
} as const;

const ADMIN_OPERATION_PERMISSION = APP_PERMISSIONS.ADMIN_OPERATION.WRITE;

export interface AppMenuItem {
  path: string;
  name: string;
  icon?: ReactNode;
  requiredPermission?: string;
  showInMenuWithoutPermission?: boolean;
  children?: AppMenuItem[];
  hideInMenu?: boolean;
}

export const proLayoutMenuData: AppMenuItem[] = [
  {
    path: '/home',
    name: 'Home',
    icon: <HomeOutlined />,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
  },
  {
    path: '/data-entry',
    name: 'Data Entry',
    icon: <FileTextOutlined />,
    requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
    showInMenuWithoutPermission: true,
    children: [
      {
        path: '/data-entry/new-form',
        name: 'New Form',
        requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
        showInMenuWithoutPermission: true,
      },
      {
        path: '/data-entry/view-form',
        name: 'View Form',
        requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
        showInMenuWithoutPermission: true,
        children: [
          {
            path: '/data-entry/view-form/record',
            name: 'Waste Record Details',
            requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
            hideInMenu: true,
          },
          {
            path: '/data-entry/view-form/requests',
            name: 'My Request Changes',
            requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/data-entry/statistic',
        name: 'Statistic',
        requiredPermission: APP_PERMISSIONS.WASTE_RECORD.WRITE,
        showInMenuWithoutPermission: true,
      },
    ],
  },
  {
    path: '/waste-data',
    name: 'Waste Data',
    icon: <UnorderedListOutlined />,
    requiredPermission: ADMIN_OPERATION_PERMISSION,
    children: [
      {
        path: '/waste-data/approval',
        name: 'Approval',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
        children: [
          {
            path: '/waste-data/approval/record',
            name: 'Waste Record Details',
            requiredPermission: ADMIN_OPERATION_PERMISSION,
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/waste-data/management',
        name: 'Management',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
        children: [
          {
            path: '/waste-data/management/record',
            name: 'Waste Record Details',
            requiredPermission: ADMIN_OPERATION_PERMISSION,
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/waste-data/requests',
        name: 'Requests',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
        children: [
          {
            path: '/waste-data/requests/record',
            name: 'Waste Record Details',
            requiredPermission: ADMIN_OPERATION_PERMISSION,
            hideInMenu: true,
          },
        ],
      },
    ],
  },
  {
    path: '/users',
    name: 'User Data',
    icon: <UsergroupAddOutlined />,
    requiredPermission: ADMIN_OPERATION_PERMISSION,
    children: [
      {
        path: '/users/approval',
        name: 'Approval',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/users/management',
        name: 'Management',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
    ],
  },
  {
    path: '/data-analytics',
    name: 'Data Analytics',
    icon: <GrAnalytics />,
    requiredPermission: ADMIN_OPERATION_PERMISSION,
  },
  {
    path: '/configurations',
    name: 'Configurations',
    icon: <ToolOutlined />,
    requiredPermission: ADMIN_OPERATION_PERMISSION,
    children: [
      {
        path: '/configurations/landfilling-cost',
        name: 'Landfilling Cost',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/configurations/utm-population',
        name: 'UTM Population',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/configurations/disposal-waste',
        name: 'Emission Factor',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/configurations/departments',
        name: 'Departments',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/configurations/role-permissions',
        name: 'Role Permissions',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
      {
        path: '/configurations/notification-emails',
        name: 'Notification Emails',
        requiredPermission: ADMIN_OPERATION_PERMISSION,
      },
    ],
  },
  {
    path: '/waste-info',
    name: 'Waste Info',
    icon: <BulbOutlined />,
  },
  {
    path: '/enquiry',
    name: 'Enquiry',
    icon: <MailOutlined />,
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    children: [
      {
        path: '/settings/edit-profile',
        name: 'Edit Profile',
      },
      {
        path: '/settings/change-password',
        name: 'Change Password',
      },
    ],
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: <BellOutlined />,
    hideInMenu: true,
  },
];

export const profileMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    label: 'Logout',
    icon: <LogoutOutlined />,
  },
];
