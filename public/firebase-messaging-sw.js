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



// public/firebase-messaging-sw.js

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'New Notification';
  const body = payload.notification?.body || payload.data?.body || '';

  const notificationOptions = {
    body: body,
    icon: '/https://safaiindex.vercel.app/safai_logo.jpeg',
    badge: '/https://safaiindex.vercel.app/safai_logo.jpeg',
    image: payload.notification?.image,
    data: payload.data || {},
    vibrate: [200, 100, 200],
    tag: payload.data?.reviewId || 'notification',
    requireInteraction: false,
    actions: [],
  };

  console.log('[SW] Showing custom notification with logo');

  // ✅ Show notification with custom options
  return self.registration.showNotification(title, notificationOptions);
});

// ✅ Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  console.log('[SW] Payload structure:', JSON.stringify(payload, null, 2));

  const title = payload.notification?.title ||
    payload.data?.title ||
    'New Notification';

  const body = payload.notification?.body ||
    payload.data?.body ||
    '';

  console.log('[SW] Extracted - Title:', title, 'Body:', body);
  console.log('[SW] Skipping manual notification (Firebase handles it automatically)');

  // ✅ Send message to React app to update Redux
  console.log('[SW] Notifying app to update Redux...');
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      console.log('[SW] Found clients:', clients.length);
      clients.forEach(client => {
        console.log('[SW] Posting message to client');
        client.postMessage({
          type: 'FCM_NOTIFICATION_BACKGROUND',
          payload: {
            title: title,
            body: body,
            data: payload.data || {},
            messageId: payload.messageId,
            timestamp: new Date().toISOString()
          }
        });
      });
    });
});

// ✅ FIXED: Handle notification clicks with correct navigation
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  console.log('[SW] Notification data:', event.notification.data);

  event.notification.close();

  const data = event.notification.data || {};

  // ✅ Build target URL based on notification type
  let targetUrl = '/dashboard'; // Default fallback

  console.log('[SW] Notification type:', data.type);
  console.log('[SW] Review ID:', data.reviewId);
  console.log('[SW] Task ID:', data.taskId);

  // ✅ FIXED: Navigate to score-management instead of cleaner-review
  if (data.type === 'review' && data.reviewId) {
    targetUrl = `/score-management?reviewId=${data.reviewId}&autoOpen=true`;
    console.log('[SW] 🎯 Navigating to score management');
  }
  else if (data.type === 'task' && data.taskId) {
    const companyId = data.companyId || '24';
    targetUrl = `/tasks/${data.taskId}?companyId=${companyId}`;
    console.log('[SW] 🎯 Navigating to task');
  }
  else if (data.type === 'shift' && data.shiftId) {
    const companyId = data.companyId || '24';
    targetUrl = `/shifts/${data.shiftId}?companyId=${companyId}`;
    console.log('[SW] 🎯 Navigating to shift');
  }

  console.log('[SW] Final target URL:', targetUrl);

  // ✅ Open or focus window with target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('[SW] Found windows:', clientList.length);

        // Try to find an existing window
        for (const client of clientList) {
          // Check if it's your app's domain
          if (client.url.includes(self.location.origin)) {
            console.log('[SW] ✅ Found existing window, focusing and navigating');

            // Post message to the app
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
              targetUrl: targetUrl
            });

            // Focus and navigate
            return client.focus().then((focusedClient) => {
              console.log('[SW] ✅ Window focused, now navigating to:', targetUrl);
              return focusedClient.navigate(targetUrl);
            });
          }
        }

        // If no window is open, open a new one
        console.log('[SW] ❌ No existing window found, opening new one');
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error('[SW] ❌ Error handling notification click:', error);
      })
  );
});
