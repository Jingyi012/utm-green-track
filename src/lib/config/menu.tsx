import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { MenuProps } from 'antd';
import React from 'react';

export const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/data-entry',
    icon: <FileTextOutlined />,
    label: 'Data Entry',
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
    key: '/waste-info',
    icon: <InfoCircleOutlined />,
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
];

export const profileMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
  },
];
