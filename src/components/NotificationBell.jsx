// src/components/NotificationBell.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast'
import { useRouter } from "next/navigation";
import { Bell, X, Check } from "lucide-react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import {
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
} from "../store/slices/notificationSlice";
import {
    useMarkNotificationAsReadMutation
} from "../store/slices/notificationApi";

const NotificationBell = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    // const { companyId } = useCompanyId();

    const { notifications, unreadCount } = useSelector(
        (state) => state.notifications
    );

    // const { companyId } = useSelector(state => state?.auth.user?.company_id);
    const companyId = useSelector(state => state?.auth?.user?.company_id);


    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [markAsReadOnBackend] = useMarkNotificationAsReadMutation();

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        //  console.log("🔔 NotificationBell - Notifications count:", notifications.length);
        //  console.log("🔔 NotificationBell - Unread count:", unreadCount);
        //   console.log("🔔 NotificationBell - Notifications:", notifications);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifications, unreadCount]);

    // ✅ Prevent body scroll when dropdown is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleNotificationClick = async (notification) => {  // ✅ Receive full notification object

        //      console.log("data ", notification);
        dispatch(markAsRead(notification.id));



        setIsOpen(false)

        if (notification.data) {  // ✅ CORRECT - Access the clicked notification's data
            const { type, reviewId } = notification.data
            //  console.log("notification 💡💡💡", type, " reviewId", reviewId);

            switch (type) {
                case "review":
                    if (reviewId && companyId) {

                        const url = `/score-management?reviewId=${reviewId}&autoOpen=true`;
                        //console.log("🚀 Navigating to:", url);
                        router.push(url);
                        // router.push(`/cleaner-review/${reviewId}?companyId=${companyId}`)
                    }
                    else {
                        //console.log('company_id', companyId);
                        //console.log('review_id', reviewId);
                        toast.error('Either reviewId or company id not provided')
                    }
                    break;

                // Add other cases as needed
                case "task":
                    if (notification.data.taskId && companyId) {
                        router.push(`/tasks/${notification.data.taskId}?companyId=${companyId}`)
                    }
                    break;

                default:
                    console.log("ℹ️ No navigation defined for type:", type);
                    break;
            }
        }
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
        <>
            {/* ✅ Backdrop overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="relative" ref={dropdownRef}>
                {/* ✅ Bell Icon Button - Touch-friendly size */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 sm:p-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
                    aria-label="Notifications"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />

                    {/* ✅ Unread Badge - Responsive sizing */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                {/* ✅ Notification Dropdown - Responsive positioning */}
                {isOpen && (
                    <div
                        className={`
                            /* Mobile: Full screen bottom sheet */
                            fixed bottom-0 left-0 right-0 
                            /* Tablet & Desktop: Dropdown */
                            md:absolute md:right-0 md:left-auto md:bottom-auto md:top-full md:mt-2
                            /* Sizing */
                            w-full md:w-96 lg:w-[28rem]
                            max-h-[85vh] md:max-h-[600px]
                            /* Styling */
                            bg-white rounded-t-3xl md:rounded-lg 
                            shadow-2xl md:shadow-xl 
                            border-t-2 md:border border-slate-200 
                            /* Layout */
                            flex flex-col
                            /* Animation */
                            animate-slide-up md:animate-fade-in
                            /* Z-index */
                            z-50
                        `}
                    >
                        {/* ✅ Mobile drag handle */}
                        <div className="md:hidden flex justify-center pt-2 pb-1">
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                        </div>

                        {/* ✅ Header - Responsive padding */}
                        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl md:rounded-t-lg flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-[10px] sm:text-xs text-red-600 font-bold bg-red-50 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="flex gap-1 sm:gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium flex items-center gap-1 rounded-md transition-colors touch-manipulation"
                                        >
                                            <Check className="w-3 h-3" />
                                            <span className="hidden sm:inline">Mark all read</span>
                                            <span className="sm:hidden">Read all</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleClearAll}
                                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-red-600 hover:text-red-800 hover:bg-red-50 font-medium rounded-md transition-colors touch-manipulation"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ✅ Notification List - Scrollable with responsive padding */}
                        <div className="overflow-y-auto flex-1 overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="px-4 sm:px-6 py-12 sm:py-16 text-center text-slate-500">
                                    <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-slate-300" />
                                    <p className="text-sm sm:text-base font-medium">No notifications yet</p>
                                    <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                                        You'll see updates here when they arrive
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`
                                                px-4 sm:px-5 py-3 sm:py-4 
                                                hover:bg-slate-50 active:bg-slate-100
                                                cursor-pointer transition-colors
                                                ${!notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                                                /* Touch-friendly minimum height */
                                                min-h-[72px] sm:min-h-[80px]
                                            `}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm sm:text-base text-slate-800 truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                        {notification.body}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-1.5">
                                                        {formatTime(notification.timestamp)}
                                                    </p>
                                                </div>

                                                {/* ✅ Touch-friendly delete button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(clearNotification(notification.id));
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 active:text-red-600 flex-shrink-0 p-1 touch-manipulation"
                                                    aria-label="Delete notification"
                                                >
                                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ✅ Mobile close button (optional) */}
                        <div className="md:hidden px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors touch-manipulation"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationBell;
