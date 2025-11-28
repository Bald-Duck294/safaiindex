// src/hooks/useNotifications.js
"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestFCMToken, listenToFCMMessages } from "@/lib/firebase/fcm"
import { addNotification, setFCMToken } from "@/store/slices/notificationSlice";
import { useSaveFCMTokenMutation } from "@/store/slices/notificationApi";
import { store } from "@/store/store";
import { useRouter } from "next/navigation";


export default function useNotifications() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const { notifications, unreadCount, fcmToken } = useSelector(
    (state) => state.notifications
  );

  const isInitialized = useRef(false);
  const processedMessageIds = useRef(new Set()); // ✅ Track processed messages
  const [saveFCMToken] = useSaveFCMTokenMutation();

  useEffect(() => {

    if (!isAuthenticated || !user || !user.id) {
      console.log("⚠️ User not authenticated, skipping FCM initialization");
      isInitialized.current = false;
      return;
    }
    if (isInitialized.current) {
      console.log("⏭️ FCM already initialized, skipping...");
      return;
    }

    if (!user || !user.id) {
      console.log("⚠️ User not logged in, skipping FCM initialization");
      return;
    }

    console.log("🚀 Initializing FCM for user:", user.id);
    isInitialized.current = true;

    let unsubscribeFCM = () => { };

    const initializeFCM = async () => {
      const token = await requestFCMToken();
      console.log("🔑 FCM Token received");

      if (token) {
        dispatch(setFCMToken(token));

        try {
          await saveFCMToken({
            fcmToken: token,
            userId: user.id
          }).unwrap();
          console.log("✅ FCM token saved to backend");
        } catch (error) {
          console.error("❌ Error saving FCM token:", error);
        }
      }

      // ✅ Helper function to add notification (prevents duplicates)
      const addNotificationToStore = (title, body, data, messageId) => {
        // Check if already processed
        if (messageId && processedMessageIds.current.has(messageId)) {
          console.log("⏭️ Message already processed:", messageId);
          return;
        }

        console.log("📝 Adding to Redux - Title:", title, "Body:", body);

        dispatch(
          addNotification({
            title,
            body,
            data: data || {},
          })
        );

        // Mark as processed
        if (messageId) {
          processedMessageIds.current.add(messageId);

          // Clean up old message IDs (keep last 50)
          if (processedMessageIds.current.size > 50) {
            const values = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(values.slice(-50));
          }
        }

        console.log("✅ Notification added to Redux");
      };

      // ✅ 1. Listen for FOREGROUND messages via onMessage
      console.log("👂 Setting up onMessage listener (foreground only)...");
      unsubscribeFCM = listenToFCMMessages((payload) => {

        const currentAuth = store.getState?.()?.auth?.isAuthenticated;
        if (!currentAuth) {
          console.log("⚠️ User logged out, ignoring notification");
          return;
        }

        console.log("🎉 onMessage FIRED - Tab is ACTIVE (foreground)");
        console.log("📦 Payload:", JSON.stringify(payload, null, 2));

        const title = payload.notification?.title ||
          payload.data?.title ||
          "New Notification";

        const body = payload.notification?.body ||
          payload.data?.body ||
          "";

        const messageId = payload.messageId || payload.fcmMessageId;

        addNotificationToStore(title, body, payload.data, messageId);
      });

      // ✅ 2. Listen for BACKGROUND messages from Service Worker
      console.log("👂 Setting up Service Worker message listener (background only)...");
      const handleServiceWorkerMessage = (event) => {
        console.log("📨 Message from SW:", event.data);

        // Handle background notifications
        if (event.data?.type === 'FCM_NOTIFICATION_BACKGROUND') {
          console.log("🌙 Background notification from SW (tab was not active)");
          const { title, body, data, messageId } = event.data.payload;

          addNotificationToStore(title, body, data, messageId);
        }

        // Handle notification clicks
        if (event.data?.type === 'NOTIFICATION_CLICKED') {
          console.log("🖱️ Notification clicked!");
          // Handle navigation if needed
          // e.g., router.push(event.data.data.screen);

          const { data, targetUrl } = event.data;
          console.log("🚀 Navigating to:", targetUrl);


          if (targetUrl) {
            router.push(targetUrl);
          }
          // if (data) {
          //   console.log("📍 Notification data:", data);
          //   // Optional: You can dispatch actions or show toast notifications here
          // }
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      }

      console.log("✅ All message listeners setup complete");

      return () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
      };
    };

    const cleanupSWListener = initializeFCM();

    return () => {
      console.log("🧹 Cleaning up FCM");
      unsubscribeFCM();
      cleanupSWListener?.then(cleanup => cleanup?.());
      isInitialized.current = false;
      processedMessageIds.current.clear();
    };
  }, [user?.id, isAuthenticated, dispatch, saveFCMToken, router]);

  return {
    notifications,
    unreadCount,
    fcmToken,
  };
}
