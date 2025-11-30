'use client';

import { useRef, useState } from 'react';
import { ProList, ActionType, PageContainer } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, message, Badge, Avatar, Typography, Space, Tooltip, theme } from 'antd';
import { CheckOutlined, DeleteOutlined, BellOutlined, ReadOutlined, RightOutlined } from '@ant-design/icons';
import { getAllNotifications, markNotificationAsRead, deleteNotification, deleteAllNotifications, markAllNotificationsAsRead } from '@/lib/services/notification';
import { Notification } from '@/lib/types/typing';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import { getNotificationStyle } from './notificationUtils';
import { NotificationType } from '@/lib/enum/notification';

dayjs.extend(relativeTime);
const { Text, Title } = Typography;

export default function NotificationPage() {
    const router = useRouter();
    const { token } = theme.useToken();
    const actionRef = useRef<ActionType | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async (params: { current?: number; pageSize?: number }) => {
        try {
            const response = await getAllNotifications({
                pageNumber: params.current || 1,
                pageSize: params.pageSize || 10,
                onlyUnread: activeTab === 'unread',
            });
            return {
                data: response.data,
                success: true,
                total: response.totalCount,
            };
        } catch (error) {
            message.error('Failed to load notifications');
            return { data: [], success: false, total: 0 };
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            message.success('Marked as read');
            actionRef.current?.reload();
        } catch {
            message.error('Failed to mark as read');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            message.success('Deleted');
            actionRef.current?.reload();
        } catch {
            message.error('Failed to delete');
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsAsRead();
            message.success('All marked as read');
            actionRef.current?.reload();
        } catch {
            message.error('Operation failed');
        }
    };

    const handleClearAll = async () => {
        try {
            await deleteAllNotifications();
            message.success('History cleared');
            actionRef.current?.reload();
        } catch {
            message.error('Operation failed');
        }
    };

    return (
        <PageContainer title={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Notifications</Title>
                    <Text type="secondary">Manage your alerts</Text>
                </div>
                <Space>
                    <Button icon={<CheckOutlined />} onClick={handleMarkAll}>
                        Mark all read
                    </Button>
                    <Popconfirm
                        title="Clear history?"
                        onConfirm={handleClearAll}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Clear All
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            {/* The List Component */}
            <ProList<Notification>
                actionRef={actionRef}
                rowKey="id"
                request={fetchNotifications}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50']
                }}
                // Makes the tabs part of the list card
                toolbar={{
                    menu: {
                        activeKey: activeTab,
                        items: [
                            { key: 'all', label: 'All' },
                            { key: 'unread', label: 'Unread' },
                        ],
                        onChange: (key) => {
                            setActiveTab(key as 'all' | 'unread');
                            actionRef.current?.reload();
                        },
                    },
                }}
                metas={{
                    avatar: {
                        render: (_, row) => {
                            // Get style based on type
                            const style = getNotificationStyle(row.type as NotificationType);

                            return (
                                <Badge dot={!row.isRead} offset={[-2, 2]}>
                                    <Avatar
                                        shape="square"
                                        size="large"
                                        icon={style.icon}
                                        style={{
                                            // If read, turn gray. If unread, use the specific color
                                            backgroundColor: row.isRead ? '#f5f5f5' : style.bgColor,
                                            color: row.isRead ? '#bfbfbf' : style.color,
                                            border: row.isRead ? '1px solid #d9d9d9' : `1px solid ${style.bgColor}` // Optional border
                                        }}
                                    />
                                </Badge>
                            );
                        },
                    },
                    title: {
                        render: (_, row) => (
                            <Space align="center">
                                <Text strong={!row.isRead} style={{ fontSize: 15 }}>
                                    {row.title}
                                </Text>
                                {!row.isRead && <Tag color="blue" style={{ margin: 0 }}>New</Tag>}
                            </Space>
                        ),
                    },
                    description: {
                        render: (_, row) => (
                            <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ display: 'block', maxWidth: 600 }}>
                                    {row.message}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                    {dayjs(row.createdAt).fromNow()}
                                </Text>
                            </div>
                        ),
                    },
                    actions: {
                        render: (_, row) => [
                            !row.isRead && (
                                <Tooltip title="Mark as read" key="mark">
                                    <Button type="text" size="small" icon={<ReadOutlined />} onClick={() => handleMarkAsRead(row.id)} />
                                </Tooltip>
                            ),
                            row.url && (
                                <Button key="view" type="link" size="small" icon={<RightOutlined />} onClick={() => router.push(row.url!)}>
                                    View
                                </Button>
                            ),
                            <Popconfirm key="del" title="Delete?" onConfirm={() => handleDelete(row.id)}>
                                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        ],
                    },
                }}
                // Custom row styling for unread items
                onItem={(record) => ({
                    style: {
                        backgroundColor: 'transparent',
                        borderRadius: 8,
                        marginBottom: 8,
                        //border: `1px solid ${record.isRead ? 'transparent' : token.colorSplit}`
                    }
                })}
            />
        </PageContainer>
    );
}