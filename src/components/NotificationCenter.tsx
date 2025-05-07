import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from '../lib/notifications';
import toast from 'react-hot-toast';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user) return;
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Erreur lors du marquage de la notification comme lue');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative dark:text-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-950/50 py-2 z-50">
          <div className="px-4 py-2 border-b dark:border-gray-700">
            <h3 className="font-semibold dark:text-white">Notifications</h3>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !notification.is_read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium dark:text-white">
                      {notification.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getNotificationIcon(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
