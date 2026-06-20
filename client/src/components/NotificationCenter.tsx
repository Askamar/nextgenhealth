import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Pill, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Notification {
    id: string;
    type: 'appointment' | 'reminder' | 'drug_alert' | 'report' | 'system';
    title: string;
    message: string;
    time: Date;
    read: boolean;
    actionUrl?: string;
}

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'appointment',
            title: 'Appointment Reminder',
            message: 'Your appointment with Dr. Wilson is tomorrow at 10:00 AM',
            time: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            read: false
        },
        {
            id: '2',
            type: 'drug_alert',
            title: 'Medication Time',
            message: 'Time to take your evening dose of Metformin 500mg',
            time: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            read: false
        },
        {
            id: '3',
            type: 'report',
            title: 'Lab Report Ready',
            message: 'Your blood test results are now available',
            time: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            read: true
        },
        {
            id: '4',
            type: 'system',
            title: 'Profile Updated',
            message: 'Your emergency contact information has been updated',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <Calendar size={18} className="text-blue-500" />;
            case 'drug_alert': return <Pill size={18} className="text-amber-500" />;
            case 'report': return <FileText size={18} className="text-green-500" />;
            case 'reminder': return <Clock size={18} className="text-purple-500" />;
            default: return <Bell size={18} className="text-slate-500" />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell size={22} className="text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-500 hover:text-blue-600"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={`font-medium text-sm ${!notification.read
                                                            ? 'text-slate-900 dark:text-white'
                                                            : 'text-slate-600 dark:text-slate-300'
                                                        }`}>
                                                        {notification.title}
                                                    </h4>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    {formatTime(notification.time)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                            <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
