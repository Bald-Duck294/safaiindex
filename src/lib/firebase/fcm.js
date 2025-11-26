// // src/lib/firebase/fcm.js
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import app from "./firebase";

// let messaging = null;

// // Initialize messaging only in browser
// if (typeof window !== "undefined") {
//     messaging = getMessaging(app);
// }

// // ⚠️ IMPORTANT: Get this VAPID key from Firebase Console
// // Go to: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// const VAPID_KEY = "BOXjoc6B-HK4cy2cYKu8IR8ZeOkLmPPkC7wtj1jIt9hSJcKvK53wTNvV2ddlLe4Jf_jJMVr6lxYxEuDCN9pErko"; // 

// /**
//  * Request FCM token from the browser
//  * This token will be sent to your backend
//  */
// export const requestFCMToken = async () => {
//     if (!messaging) {
//         console.warn("FCM messaging not available (SSR or no browser support)");
//         return null;
//     }

//     try {
//         // Request notification permission
//         const permission = await Notification.requestPermission();

//         if (permission === "granted") {
//             const token = await getToken(messaging, { vapidKey: VAPID_KEY });
//             console.log("✅ FCM Token:", token);

//             // TODO: Send this token to your backend to store in database
//             // Example: await saveTokenToBackend(token);

//             return token;
//         } else {
//             console.warn("⚠️ Notification permission denied");
//             return null;
//         }
//     } catch (error) {
//         console.error("❌ Error getting FCM token:", error);
//         return null;
//     }
// };

// /**
//  * Listen for foreground messages (when dashboard is open)
//  * @param {Function} callback - Function to handle incoming message
//  */
// export const listenToFCMMessages = (callback) => {
//     if (!messaging) return () => { };

//     return onMessage(messaging, (payload) => {
//         console.log("📩 Foreground message received:", payload);
//         callback(payload);
//     });
// };


// // src/lib/firebase/fcm.js
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import app from "./firebase";

// let messaging = null;

// if (typeof window !== "undefined") {
//     messaging = getMessaging(app);
// }

// const VAPID_KEY = "BOXjoc6B-HK4cy2cYKu8IR8ZeOkLmPPkC7wtj1jIt9hSJcKvK53wTNvV2ddlLe4Jf_jJMVr6lxYxEuDCN9pErko";

// /**
//  * Register service worker manually for Next.js
//  */
// // const registerServiceWorker = async () => {
// //     if (!("serviceWorker" in navigator)) {
// //         console.log("Service Worker not supported");
// //         return null;
// //     }

// //     try {
// //         // Check if service worker is already registered
// //         const registration = await navigator.serviceWorker.getRegistration("/firebase-push-notification-scope");

// //         if (registration) {
// //             console.log("✅ Service Worker already registered");
// //             return registration;
// //         }

// //         // Register new service worker
// //         const newRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
// //             scope: "/firebase-push-notification-scope",
// //         });

// //         console.log("✅ Service Worker registered successfully");

// //         // Wait for service worker to be ready
// //         await navigator.serviceWorker.ready;

// //         return newRegistration;
// //     } catch (error) {
// //         console.error("❌ Service Worker registration failed:", error);
// //         return null;
// //     }
// // };


// // In your fcm.js, update the registerServiceWorker function
// const registerServiceWorker = async () => {
//     if (!("serviceWorker" in navigator)) {
//         console.log("Service Worker not supported");
//         return null;
//     }

//     try {
//         // ✅ Use default scope instead of custom scope
//         const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

//         console.log("✅ Service Worker registered:", registration);
//         console.log("📍 Service Worker scope:", registration.scope);
//         console.log("🟢 Service Worker state:", registration.active?.state);

//         await navigator.serviceWorker.ready;
//         console.log("✅ Service Worker is ready");

//         return registration;
//     } catch (error) {
//         console.error("❌ Service Worker registration failed:", error);
//         return null;
//     }
// };

// /**
//  * Request FCM token from the browser
//  */
// export const requestFCMToken = async () => {
//     if (!messaging) {
//         console.warn("FCM messaging not available (SSR or no browser support)");
//         return null;
//     }

//     try {
//         // Check notification support
//         if (!("Notification" in window)) {
//             console.log("ℹ️ Browser doesn't support notifications");
//             return null;
//         }

//         const currentPermission = Notification.permission;

//         // If denied, return early
//         if (currentPermission === "denied") {
//             console.log("ℹ️ Notification permission was previously denied");
//             return null;
//         }

//         // ✅ Register service worker BEFORE requesting token
//         console.log("📝 Registering service worker...");
//         const registration = await registerServiceWorker();

//         if (!registration) {
//             console.error("❌ Failed to register service worker");
//             return null;
//         }

//         // Request permission if needed
//         let permission = currentPermission;
//         if (permission === "default") {
//             console.log("📩 Requesting notification permission...");
//             permission = await Notification.requestPermission();
//         }

//         if (permission === "granted") {
//             // ✅ Get token with service worker registration
//             const token = await getToken(messaging, {
//                 vapidKey: VAPID_KEY,
//                 serviceWorkerRegistration: registration,
//             });

//             console.log("✅ FCM Token received");
//             return token;
//         } else {
//             console.log("ℹ️ User declined notification permission");
//             return null;
//         }
//     } catch (error) {
//         console.error("❌ Error getting FCM token:", error);
//         return null;
//     }
// };

// /**
//  * Listen for foreground messages
//  */
// // export const listenToFCMMessages = (callback) => {
// //     if (!messaging) return () => { };

// //     return onMessage(messaging, (payload) => {
// //         console.log("📩 Foreground message received:", payload);
// //         callback(payload);
// //     });
// // };


// export const listenToFCMMessages = (callback) => {
//     if (!messaging) return () => { };

//     return onMessage(messaging, (payload) => {
//         console.log("📩 Foreground message received:", payload);
//         console.log("📩 Notification title:", payload.notification?.title);
//         console.log("📩 Notification body:", payload.notification?.body);
//         callback(payload);
//     });
// };



// src/lib/firebase/fcm.js
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);
}

const VAPID_KEY = "BOXjoc6B-HK4cy2cYKu8IR8ZeOkLmPPkC7wtj1jIt9hSJcKvK53wTNvV2ddlLe4Jf_jJMVr6lxYxEuDCN9pErko";



const ensureServiceWorkerReady = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log("⚠️ Service Worker not supported");
        return null;
    }

    try {
        // Check if service worker is already registered
        let registration = await navigator.serviceWorker.getRegistration('/firebase-cloud-messaging-push-scope');

        if (!registration) {
            console.log("📝 No Firebase SW found, registering...");
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/firebase-cloud-messaging-push-scope'
            });
            console.log("✅ Service worker registered");
        } else {
            console.log("✅ Service worker already registered");
        }

        // ✅ IMPORTANT: Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        console.log("✅ Service worker is ready");

        return registration;
    } catch (error) {
        console.error("❌ Service worker registration failed:", error);
        return null;
    }
};


/**
 * Request FCM token
 */
export const requestFCMToken = async () => {
    if (!messaging) {
        console.warn("FCM messaging not available");
        return null;
    }

    try {
        if (!("Notification" in window)) {
            console.log("ℹ️ Browser doesn't support notifications");
            return null;
        }

        const currentPermission = Notification.permission;

        if (currentPermission === "denied") {
            console.log("ℹ️ Notification permission denied");
            return null;
        }

        let permission = currentPermission;
        if (permission === "default") {
            console.log("📩 Requesting notification permission...");
            permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
            // ✅ CRITICAL FIX: Ensure service worker is ready BEFORE getting token
            console.log("⏳ Ensuring service worker is ready...");
            const registration = await ensureServiceWorkerReady();

            if (!registration) {
                console.error("❌ Service worker not available");
                return null;
            }

            // ✅ Get token with the ready service worker registration
            console.log("🔑 Requesting FCM token...");
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration, // ✅ Pass the registration
            });

            console.log("✅ FCM Token received");
            return token;
        } else {
            console.log("ℹ️ User declined notification permission");
            return null;
        }
    } catch (error) {
        console.error("❌ Error getting FCM token:", error);

        // ✅ Better error messages
        if (error.name === 'AbortError') {
            console.error("💡 Hint: Service worker might not be active yet. Try refreshing the page.");
        }

        return null;
    }
};


export const deleteFCMToken = async () => {
    if (!messaging) {
        console.warn("FCM messaging not available");
        return false;
    }

    try {
        const deleted = await deleteToken(messaging);

        if (deleted) {
            console.log("✅ FCM token deleted successfully");

            // Clear notification permission (optional - resets permission state)
            // Note: This doesn't actually revoke browser permission, just clears the token
            return true;
        } else {
            console.log("ℹ️ No FCM token to delete");
            return false;
        }
    } catch (error) {
        console.error("❌ Error deleting FCM token:", error);
        return false;
    }
};


/**
 * ✅ Listen for BOTH foreground messages AND service worker messages
 */
export const listenToFCMMessages = (callback) => {
    if (!messaging) {
        console.log("⚠️ Messaging not initialized");
        return () => { };
    }

    console.log("🎧 Registering message handlers...");

    // ✅ 1. Listen for foreground messages (if notification object exists)
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        console.log("🎉 onMessage FIRED!");
        console.log("📦 Payload:", JSON.stringify(payload, null, 2));
        callback(payload);
    });

    // ✅ 2. Listen for messages from Service Worker
    const handleServiceWorkerMessage = (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            console.log("🖱️ Notification clicked in SW:", event.data);
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

    console.log("✅ Message handlers registered");

    // Return cleanup function
    return () => {
        console.log("🧹 Cleaning up message handlers");
        unsubscribeOnMessage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
    };
};
