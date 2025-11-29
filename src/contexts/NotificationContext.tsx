import { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface Notification {
  id: string;
  type: string;
  message: string;
  url: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationContext = createContext<{
  notifications: Notification[];
  markAsRead: (id: string) => void;
}>({ notifications: [], markAsRead: () => { } });

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("/notificationHub")
      .withAutomaticReconnect()
      .build();

    connection.start();

    connection.on("ReceiveNotification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      connection.stop();
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // Call API to mark as read
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
