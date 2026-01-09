"use client";

import { useState, useEffect } from "react";
import Toast, { ToastType } from "./Toast";

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

let notificationId = 0;
const listeners: Array<(notification: Notification) => void> = [];

export function showNotification(message: string, type: ToastType = 'info') {
  const id = `notification-${++notificationId}`;
  listeners.forEach(listener => listener({ id, message, type }));
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="animate-slide-in-right"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}
