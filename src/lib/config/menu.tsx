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
import React from 'react';

export type AppMenuItem = Exclude<MenuProps["items"], undefined>[number] & {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  roles?: string[];
  children?: AppMenuItem[];
  hideInMenu?: boolean;
};

export const menuItems: AppMenuItem[] = [
  {
    key: '/home',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/data-entry',
    icon: <FileTextOutlined />,
    label: 'Data Entry',
    roles: ['Admin', 'Green Manager'],
    children: [
      {
        key: '/data-entry/new-form',
        label: 'New Form',
      },
      {
        key: '/data-entry/view-form',
        label: 'View Form',
      },
      {
        key: '/data-entry/statistic',
        label: 'Statistic',
      }
    ]
  },
  {
    key: '/waste-records',
    icon: <UnorderedListOutlined />,
    label: 'Waste Records',
    roles: ['Admin'],
    children: [
      {
        key: '/waste-records/approval',
        label: 'Approval',
      },
      {
        key: '/waste-records/management',
        label: 'Management',
      }
    ]
  },
  {
    key: '/users',
    icon: <UsergroupAddOutlined />,
    label: 'Users',
    roles: ['Admin'],
    children: [
      {
        key: '/users/approval',
        label: 'Approval',
      },
      {
        key: '/users/management',
        label: 'Management',
      }
    ]
  },
  {
    key: '/requests',
    icon: <MessageOutlined />,
    label: 'Requests',
    roles: ['Admin'],
  },
  {
    key: '/configurations',
    icon: <ToolOutlined />,
    label: 'Configurations',
    roles: ['Admin'],
  },
  {
    key: '/waste-info',
    icon: <BulbOutlined />,
    label: 'Waste Info',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    children: [
      {
        key: '/settings/edit-profile',
        label: 'Edit Profile',
      },
      {
        key: '/settings/change-password',
        label: 'Change Password',
      }
    ]
  },
  {
    key: '/enquiry',
    icon: <MailOutlined />,
    label: 'Enquiry',
  },
  {
    key: '/notifications',
    icon: <BellOutlined />,
    label: 'Notifications',
    hideInMenu: true
  },
];

export const profileMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
  },
];
