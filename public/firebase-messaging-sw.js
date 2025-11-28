// // public/firebase-messaging-sw.js

// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// firebase.initializeApp({
//   apiKey: "AIzaSyD1n0JBEZg4FGy7FYecKdlQJ44CRAxlN1k",
//   authDomain: "safai-ai-3489a.firebaseapp.com",
//   projectId: "safai-ai-3489a",
//   storageBucket: "safai-ai-3489a.firebasestorage.app",
//   messagingSenderId: "937583258312",
//   appId: "1:937583258312:web:c1adac80b8033608fb53fd",
//   measurementId: "G-D67EE5P807"
// });

// const messaging = firebase.messaging();

// // ✅ Handle ONLY background messages (when tab is not visible)
// messaging.onBackgroundMessage((payload) => {
//   console.log('[SW] Background message received:', payload);
//   console.log('[SW] Payload structure:', JSON.stringify(payload, null, 2));

//   const title = payload.notification?.title || 
//                 payload.data?.title || 
//                 'New Notification';

//   const body = payload.notification?.body || 
//                payload.data?.body || 
//                '';

//   console.log('[SW] Extracted - Title:', title, 'Body:', body);

//   // ✅ 1. Show browser notification
//   const notificationOptions = {
//     body: body,
//     icon: '/icon.png',
//     badge: '/badge.png',
//     tag: payload.messageId || Date.now().toString(),
//     requireInteraction: false,
//     data: {
//       ...payload.data,
//       messageId: payload.messageId,
//       title: title,
//       body: body
//     }
//   };

//   self.registration.showNotification(title, notificationOptions);

//   // ✅ 2. Send to React app ONLY if in background
//   // The app will handle it when user comes back
//   console.log('[SW] Notifying app about background notification...');
//   self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
//     .then(clients => {
//       console.log('[SW] Found clients:', clients.length);
//       clients.forEach(client => {
//         console.log('[SW] Posting message to client');
//         client.postMessage({
//           type: 'FCM_NOTIFICATION_BACKGROUND', // ✅ Changed type
//           payload: {
//             title: title,
//             body: body,
//             data: payload.data || {},
//             messageId: payload.messageId,
//             timestamp: new Date().toISOString()
//           }
//         });
//       });
//     });
// });

// // ✅ Handle notification clicks
// self.addEventListener('notificationclick', (event) => {
//   console.log('[SW] Notification clicked:', event);
//   event.notification.close();

//   const data = event.notification.data;
//   const targetUrl = data?.screen ? `/?screen=${data.screen}` : '/';

//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true })
//       .then((clientList) => {
//         for (const client of clientList) {
//           client.postMessage({
//             type: 'NOTIFICATION_CLICKED',
//             data: data
//           });

//           if ('focus' in client) {
//             return client.focus();
//           }
//         }

//         if (clients.openWindow) {
//           return clients.openWindow(targetUrl);
//         }
//       })
//   );
// });
// public/firebase-messaging-sw.js
// public/firebase-messaging-sw.js
// public/firebase-messaging-sw.js
// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD1n0JBEZg4FGy7FYecKdlQJ44CRAxlN1k",
  authDomain: "safai-ai-3489a.firebaseapp.com",
  projectId: "safai-ai-3489a",
  storageBucket: "safai-ai-3489a.firebasestorage.app",
  messagingSenderId: "937583258312",
  appId: "1:937583258312:web:c1adac80b8033608fb53fd",
  measurementId: "G-D67EE5P807"
});

const messaging = firebase.messaging();

// ✅ Store globally
let globalNotificationData = {};

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notification received:', payload);

  // ✅ Store data globally
  globalNotificationData = {
    type: payload.data?.type,
    reviewId: payload.data?.reviewId,
    taskId: payload.data?.taskId,
  };

  console.log('[SW] Stored notification data:', globalNotificationData);

  // Send to Redux
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'FCM_NOTIFICATION_BACKGROUND',
          payload: {
            title: payload.notification?.title || payload.data?.title,
            body: payload.notification?.body || payload.data?.body,
            data: payload.data || {},
            messageId: payload.messageId,
            timestamp: new Date().toISOString()
          }
        });
      });
    });
});

// ✅ Handle notification clicks - USE GLOBAL DATA
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] ========== NOTIFICATION CLICKED ==========');
  console.log('[SW] Event:', event);
  console.log('[SW] Event notification:', event.notification);
  console.log('[SW] Event notification data:', event.notification.data);
  console.log('[SW] Global notification data:', globalNotificationData);

  event.notification.close();

  // ✅ Try multiple data sources
  const data = event.notification.data || globalNotificationData || {};

  console.log('[SW] Final data:', data);
  console.log('[SW] Data type:', data.type);
  console.log('[SW] Data reviewId:', data.reviewId);

  let targetUrl = '/dashboard';

  if (data.type === 'review' && data.reviewId) {
    targetUrl = `/score-management?reviewId=${data.reviewId}&autoOpen=true`;
    console.log('[SW] ✅ Built review URL:', targetUrl);
  } else if (data.type === 'task' && data.taskId) {
    targetUrl = `/tasks/${data.taskId}`;
    console.log('[SW] ✅ Built task URL:', targetUrl);
  } else {
    console.log('[SW] ⚠️ NO DATA FOUND - using default');
  }

  console.log('[SW] Final target URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('[SW] Found', clientList.length, 'windows');

        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            console.log('[SW] ✅ Focusing existing window');
            return client.focus().then(() => {
              console.log('[SW] ✅ Navigating to:', targetUrl);
              return client.navigate(targetUrl);
            });
          }
        }

        console.log('[SW] ❌ No existing window, opening new one');
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .then(() => {
        console.log('[SW] ========== NAVIGATION COMPLETE ==========');
      })
      .catch((error) => {
        console.error('[SW] ❌ ERROR:', error);
      })
  );
});
