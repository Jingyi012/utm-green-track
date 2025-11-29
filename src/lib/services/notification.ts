import { GeneralResponse, PagedResponse } from "../types/apiResponse";
import { Notification } from "../types/typing";
import api from "../utils/axios";

const API_URL = '/api/notifications';

// Get paginated notifications
export async function getAllNotifications(
    params: {
        pageNumber?: number;
        pageSize?: number;
        onlyUnread?: boolean;
    },
    options?: { [key: string]: any }
) {
    return api.get<PagedResponse<Notification[]>>(`${API_URL}`, {
        params,
        ...options,
    });
}

export async function getUnreadNotificationCount(
    options?: { [key: string]: any }
) {
    return api.get<GeneralResponse<number>>(`${API_URL}/count-unread`, {
        ...options,
    });
}

// Mark single notification as read
export async function markNotificationAsRead(id: string, options?: { [key: string]: any }) {
    return api.patch<GeneralResponse<boolean>>(`${API_URL}/mark-as-read/${id}`, null, { ...options });
}

// Mark all notifications as read for current user
export async function markAllNotificationsAsRead(options?: { [key: string]: any }) {
    return api.patch<GeneralResponse<boolean>>(`${API_URL}/mark-all-as-read`, null, { ...options });
}

// Delete single notification
export async function deleteNotification(id: string, options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/${id}`, { ...options });
}

// Delete all notifications for current user
export async function deleteAllNotifications(options?: { [key: string]: any }) {
    return api.delete<GeneralResponse<string>>(`${API_URL}/delete-all`, { ...options });
}
