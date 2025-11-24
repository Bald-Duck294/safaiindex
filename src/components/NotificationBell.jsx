// src/components/NotificationBell.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X, Check } from "lucide-react";
import {
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
} from "../store/slices/notificationSlice";
import {
    useMarkNotificationAsReadMutation
} from "../store/slices/notificationApi"; // ← Optional: if you want to sync with backend

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector(
        (state) => state.notifications
    );

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // ✅ Optional: RTK Query mutation to mark as read on backend
    const [markAsReadOnBackend] = useMarkNotificationAsReadMutation();

    // Close dropdown when clicking outside
    useEffect(() => {
        console.log("🔔 NotificationBell - Notifications count:", notifications.length);
        console.log("🔔 NotificationBell - Unread count:", unreadCount);
        console.log("🔔 NotificationBell - Notifications:", notifications);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (id) => {
        dispatch(markAsRead(id));

        // ✅ Optional: Mark as read on backend too
        // try {
        //   await markAsReadOnBackend(id).unwrap();
        // } catch (error) {
        //   console.error("Error marking notification as read:", error);
        // }
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleClearAll = () => {
        dispatch(clearAllNotifications());
        setIsOpen(false);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
                        <h3 className="font-semibold text-slate-800 text-sm">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 text-xs text-red-600 font-bold">
                                    ({unreadCount} new)
                                </span>
                            )}
                        </h3>

                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm">No notifications yet</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    You'll see updates here when they arrive
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.id)}
                                    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm text-slate-800 truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                {notification.body}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {formatTime(notification.timestamp)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(clearNotification(notification.id));
                                            }}
                                            className="text-slate-400 hover:text-red-500 flex-shrink-0"
                                            aria-label="Delete notification"
                                        >
                                            <X className="w-4 h-4" />
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
