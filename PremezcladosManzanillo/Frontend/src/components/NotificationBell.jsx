import React, { useState, useEffect, useRef } from 'react';
import { Bell, Mail, MailOpen, Trash2 } from 'lucide-react';
import api from '../utils/api'; // Assuming a common API utility
import { useAuth0 } from '@auth0/auth0-react'; // To get user ID

const NotificationBell = () => {
    const { user } = useAuth0();
    const userId = user?.sub;
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: poll for new notifications every X seconds
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    if (!userId) return null; // Only show bell if user is authenticated

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5 md:w-6 md:h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50"
                >
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-primary">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto bg-white dark:bg-dark-surface">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-500 dark:text-gray-300 text-center">No hay notificaciones.</p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 transition-colors ${
                                        notification.read 
                                            ? 'bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-primary' 
                                            : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-l-4 border-l-blue-500 dark:border-l-blue-400'
                                    }`}
                                >
                                    <div className="flex-1 pr-3">
                                        <p className={`text-sm ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                            {new Date(notification.createdAt).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 transition-colors"
                                                title="Marcar como leído"
                                            >
                                                <MailOpen className="w-4 h-4" />
                                            </button>
                                        )}
                                        {notification.read && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                                                title="Marcar como no leído"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }}
                                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300 transition-colors"
                                            title="Eliminar notificación"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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

export default NotificationBell;
