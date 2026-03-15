import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  BulbOutlined,
  ToolOutlined,
  MailOutlined,
  HomeOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ReactNode } from 'react';

export interface AppMenuItem {
  path: string;
  name: string;
  icon?: ReactNode;
  roles?: string[];
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
    roles: ['Admin', 'Green Manager'],
    children: [
      {
        path: '/data-entry/new-form',
        name: 'New Form',
      },
      {
        path: '/data-entry/view-form',
        name: 'View Form',
      },
      {
        path: '/data-entry/statistic',
        name: 'Statistic',
      },
    ],
  },
  {
    path: '/waste-data',
    name: 'Waste Data',
    icon: <UnorderedListOutlined />,
    roles: ['Admin'],
    children: [
      {
        path: '/waste-data/approval',
        name: 'Approval',
      },
      {
        path: '/waste-data/management',
        name: 'Management',
      },
      {
        path: '/requests',
        name: 'Requests',
      },
    ],
  },
  {
    path: '/users',
    name: 'User Data',
    icon: <UsergroupAddOutlined />,
    roles: ['Admin'],
    children: [
      {
        path: '/users/approval',
        name: 'Approval',
      },
      {
        path: '/users/management',
        name: 'Management',
      },
    ],
  },
  {
    path: '/data-analytics',
    name: 'Data Analytics',
    icon: <ToolOutlined />,
    roles: ['Admin'],
  },
  {
    path: '/configurations',
    name: 'Configurations',
    icon: <ToolOutlined />,
    roles: ['Admin'],
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
