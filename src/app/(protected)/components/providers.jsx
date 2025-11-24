"use client";

import useNotifications from "@/lib/hooks/useNotifications";

export default function NotificationProvider({ children }) {
    useNotifications(); // ✅ This triggers FCM token generation

    return <>{children}</>;
}
