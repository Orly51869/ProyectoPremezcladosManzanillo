import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Bell } from 'lucide-react';
import api from '../utils/api';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDate } from '../utils/helpers'; // Asumiendo que existe o usar nativo

const NotificationsPage = () => {
    const { user, isLoading } = useAuth0();
    const [notifications, setNotifications] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const userId = user?.sub;

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            setLoadingData(true);
            const response = await api.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    if (isLoading || loadingData) return <div className="p-8 text-center dark:text-gray-300">Cargando notificaciones...</div>;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                            <Bell className="w-6 h-6 text-brand-primary dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No tienes notificaciones.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-start justify-between p-6 transition-colors ${notification.read
                                            ? 'bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-primary'
                                            : 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 border-l-4 border-l-brand-primary'
                                        }`}
                                >
                                    <div className="flex-1 pr-6">
                                        <p className={`text-base ${notification.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white font-semibold'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                            {new Date(notification.createdAt).toLocaleString('es-ES', {
                                                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-2 rounded-lg text-brand-primary hover:bg-brand-light/50 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                                                title="Marcar como leído"
                                            >
                                                <MailOpen className="w-5 h-5" />
                                            </button>
                                        )}
                                        {notification.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)} // Logic to mark unread if needed, or just disabled
                                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 transition-colors"
                                                title="Leído"
                                                disabled
                                            >
                                                <MailOpen className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteNotification(notification.id)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
