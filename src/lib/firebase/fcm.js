// src/lib/firebase/fcm.js
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);
}

const VAPID_KEY = "BOXjoc6B-HK4cy2cYKu8IR8ZeOkLmPPkC7wtj1jIt9hSJcKvK53wTNvV2ddlLe4Jf_jJMVr6lxYxEuDCN9pErko";

/**
 * ✅ Ensure service worker is registered and ready
 */
const ensureServiceWorkerReady = async () => {
    if (!('serviceWorker' in navigator)) {
       // //console.log("⚠️ Service Worker not supported");
        return null;
    }

    try {
        //console.log("📝 Registering service worker...");
        
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        //console.log("✅ Service worker registered:", registration.scope);

        // Wait for it to be ready
        await navigator.serviceWorker.ready;
        //console.log("✅ Service worker is ready");

        return registration;
    } catch (error) {
        //console.error("❌ Service worker registration failed:", error);
        return null;
    }
};

/**
 * Request FCM token
 */
export const requestFCMToken = async () => {
    //console.log("🎯 requestFCMToken called");
    
    if (!messaging) {
        //console.warn("❌ FCM messaging not available");
        return null;
    }

    try {
        // Step 1: Check if Notification API exists
        if (!("Notification" in window)) {
            //console.log("❌ Browser doesn't support notifications");
            return null;
        }
        //console.log("✅ Notification API available");

        // Step 2: Check current permission
        let permission = Notification.permission;
        //console.log("📋 Current notification permission:", permission);

        // Step 3: Handle denied permission
        if (permission === "denied") {
            //console.log("❌ Notification permission DENIED by user");
            //console.log("💡 User must manually enable notifications in browser settings");
            return null;
        }

        // Step 4: Request permission if needed
        if (permission === "default") {
            //console.log("📩 Requesting notification permission...");
            permission = await Notification.requestPermission();
            //console.log("📋 Permission result:", permission);
        }

        // Step 5: If not granted, stop here
        if (permission !== "granted") {
            //console.log("❌ Notification permission not granted:", permission);
            return null;
        }
        //console.log("✅ Notification permission GRANTED");

        // Step 6: Ensure service worker is ready
        //console.log("⏳ Ensuring service worker is ready...");
        const registration = await ensureServiceWorkerReady();

        if (!registration) {
            //console.error("❌ Service worker registration failed");
            return null;
        }
        //console.log("✅ Service worker ready, proceeding to get token");

        // Step 7: Get FCM token
        //console.log("🔑 Requesting FCM token from Firebase...");
        //console.log("📍 Using VAPID key:", VAPID_KEY.substring(0, 20) + "...");
        
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            //console.error("❌ FCM token is null or empty");
            return null;
        }

        //console.log("✅ FCM Token received successfully!");
        //console.log("🔑 Token (first 50 chars):", token.substring(0, 50) + "...");
        //console.log("📏 Token length:", token.length);
        
        return token;

    } catch (error) {
        //console.error("❌ Error getting FCM token:", error);
        //console.error("❌ Error name:", error.name);
        //console.error("❌ Error message:", error.message);
        //console.error("❌ Error stack:", error.stack);
        
        if (error.name === 'AbortError') {
            //console.error("💡 Hint: Service worker issue. Try:");
            //console.error("   1. Refresh the page");
            //console.error("   2. Check if firebase-messaging-sw.js exists in /public");
            //console.error("   3. Clear cache and reload (Ctrl+Shift+R)");
        }
        
        return null;
    }
};

/**
 * Delete FCM token (call on logout)
 */
export const deleteFCMToken = async () => {
    if (!messaging) {
        //console.warn("FCM messaging not available");
        return false;
    }

    try {
        const deleted = await deleteToken(messaging);

        if (deleted) {
            //console.log("✅ FCM token deleted successfully");
            return true;
        } else {
            //console.log("ℹ️ No FCM token to delete");
            return false;
        }
    } catch (error) {
        //console.error("❌ Error deleting FCM token:", error);
        return false;
    }
};

/**
 * Listen for foreground messages
 */
export const listenToFCMMessages = (callback) => {
    //console.log("🎯 listenToFCMMessages called");
    
    if (!messaging) {
        //console.log("⚠️ Messaging not initialized");
        return () => { };
    }

    //console.log("🎧 Registering message handlers...");

    // Listen for foreground messages
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        //console.log("🎉 onMessage FIRED!");
        //console.log("📦 Payload:", JSON.stringify(payload, null, 2));
        callback(payload);
    });

    // Listen for messages from Service Worker
    const handleServiceWorkerMessage = (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            //console.log("🖱️ Notification clicked in SW:", event.data);
            callback({
                fromServiceWorker: true,
                action: 'click',
                data: event.data.data
            });
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    //console.log("✅ Message handlers registered");

    return () => {
        //console.log("🧹 Cleaning up message handlers");
        unsubscribeOnMessage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
    };
};
