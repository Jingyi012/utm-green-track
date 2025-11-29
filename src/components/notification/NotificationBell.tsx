'use client';

import { useEffect, useState, useRef } from 'react';
import { Badge, Button, Dropdown, List, Spin, Typography, Avatar, Tabs, Empty, Tooltip, theme, Skeleton } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, ReadOutlined, HistoryOutlined, BellFilled } from '@ant-design/icons';
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getUnreadNotificationCount } from '@/lib/services/notification';
import { Notification } from '@/lib/types/typing';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import { getNotificationStyle } from './notificationUtils';

dayjs.extend(relativeTime);
const { Text, Paragraph } = Typography;
const { useToken } = theme;

export const NotificationBell: React.FC = () => {
    const router = useRouter();
    const { token } = useToken();

    // Separate state for the badge vs the list
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [loadingList, setLoadingList] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    // 1. Efficiently fetch ONLY the count for the Badge
    const fetchBadgeCount = async () => {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count.data);
        } catch (error) {
        }
    };

    // 2. Fetch the actual list data (Only when needed)
    const fetchList = async () => {
        setLoadingList(true);
        try {
            const response = await getAllNotifications({
                pageNumber: 1,
                pageSize: 10, // Limit dropdown to 10 items for performance
                onlyUnread: activeTab === 'unread'
            });
            setNotifications(response.data);

            // If we are on 'all' tab, we can sync the count from the response meta if available
            // otherwise, the polling handles it.
        } catch (err) {
        } finally {
            setLoadingList(false);
        }
    };

    // Polling: Update badge every 60 seconds
    useEffect(() => {
        fetchBadgeCount();
        const interval = setInterval(fetchBadgeCount, 60000);
        return () => clearInterval(interval);
    }, []);

    // Load list data when opening dropdown or changing tabs
    useEffect(() => {
        if (dropdownOpen) {
            fetchList();
            // Also refresh count to be accurate
            fetchBadgeCount();
        }
    }, [dropdownOpen, activeTab]);

    const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1)); // Decrement badge locally
        } catch (error) {
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
        }
    };

    const handleItemClick = (item: Notification) => {
        if (!item.isRead) {
            markNotificationAsRead(item.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setDropdownOpen(false);
        if (item.url) router.push(item.url);
    };

    // The Custom Dropdown UI
    const renderDropdown = () => (
        <div style={{
            width: 380,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            border: `1px solid ${token.colorSplit}`
        }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${token.colorSplit}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>Notifications</Text>
                    <Tooltip title="Mark all displayed as read">
                        <Button type="text" size="small" icon={<CheckOutlined />} onClick={handleMarkAll} disabled={unreadCount === 0} />
                    </Tooltip>
                </div>
                <Tabs
                    activeKey={activeTab}
                    onChange={(k) => setActiveTab(k as any)}
                    items={[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }]}
                    size="small"
                    tabBarStyle={{ margin: 0 }}
                />
            </div>

            {/* List Area */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {loadingList ? (
                    <div style={{ padding: 16 }}>
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                        <Skeleton avatar paragraph={{ rows: 1 }} active />
                    </div>
                ) : notifications.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" style={{ margin: '30px 0' }} />
                ) : (
                    <List
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                className="notification-item-hover"
                                onClick={() => handleItemClick(item)}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    background: item.isRead ? 'transparent' : token.colorPrimaryBg,
                                    borderBottom: `1px solid ${token.colorSplit}`,
                                    transition: 'background 0.2s'
                                }}
                                actions={[
                                    !item.isRead && (
                                        <Tooltip title="Mark read">
                                            <Button
                                                type="text" size="small"
                                                icon={<ReadOutlined style={{ color: token.colorPrimary }} />}
                                                onClick={(e) => handleMarkAsRead(e, item.id)}
                                            />
                                        </Tooltip>
                                    )
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        (() => {
                                            const style = getNotificationStyle(item.type);
                                            return (
                                                <Badge dot={!item.isRead} offset={[-2, 2]} color={token.colorPrimary}>
                                                    <Avatar
                                                        shape="square"
                                                        icon={style.icon}
                                                        style={{
                                                            backgroundColor: item.isRead ? token.colorFillSecondary : style.bgColor,
                                                            color: item.isRead ? token.colorTextDisabled : style.color
                                                        }}
                                                    />
                                                </Badge>
                                            );
                                        })()
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <Text strong={!item.isRead} ellipsis={{ tooltip: item.title }} style={{ maxWidth: 160 }}>{item.title}</Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.createdAt).fromNow()}</Text>
                                        </div>
                                    }
                                    description={<Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ fontSize: 12, margin: 0 }}>{item.message}</Paragraph>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: 8, textAlign: 'center', borderTop: `1px solid ${token.colorSplit}` }}>
                <Button type="link" size="small" onClick={() => { setDropdownOpen(false); router.push('/notifications'); }}>
                    See all history <HistoryOutlined />
                </Button>
            </div>
        </div>
    );

    return (
        <Dropdown
            dropdownRender={renderDropdown}
            trigger={['click']}
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            placement="bottomRight"
        >
            <div className="flex items-center justify-center w-10 h-10 cursor-pointer rounded-full hover:bg-yellow-500/20 transition-colors relative">
                <Badge
                    count={unreadCount}
                    overflowCount={99}
                    offset={[-2, 4]}
                    className="drop-shadow-md"
                >
                    <BellFilled
                        style={{
                            fontSize: 22,
                            color: '#facc15', // Tailwind yellow-400
                        }}
                    />
                </Badge>
            </div>

        </Dropdown>
    );
};