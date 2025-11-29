import { NotificationType } from '@/lib/enum/notification';
import {
    UserAddOutlined,
    CommentOutlined,
    FileTextOutlined,
    DeleteOutlined, // Or RestOutlined for 'Bin'
    BellOutlined
} from '@ant-design/icons';

export const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
        case NotificationType.UserRegistration:
            return {
                icon: <UserAddOutlined />,
                color: '#52c41a', // Green
                bgColor: '#f6ffed'
            };
        case NotificationType.Enquiry:
            return {
                icon: <CommentOutlined />,
                color: '#faad14', // Gold/Orange
                bgColor: '#fff7e6'
            };
        case NotificationType.Request:
            return {
                icon: <FileTextOutlined />,
                color: '#1890ff', // Blue
                bgColor: '#e6f7ff'
            };
        case NotificationType.WasteRecord:
            return {
                icon: <DeleteOutlined />, // or <RestOutlined />
                color: '#ff4d4f', // Red/Volcano
                bgColor: '#fff1f0'
            };
        default:
            return {
                icon: <BellOutlined />,
                color: '#1890ff',
                bgColor: '#e6f7ff'
            };
    }
};