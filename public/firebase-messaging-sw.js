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

  // ✅ DON'T show notification here - Firebase already shows it automatically
  // This prevents duplicate notifications
  console.log('[SW] Skipping manual notification (Firebase handles it automatically)');

  // ✅ Just send message to React app to update Redux
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

  // ✅ IMPORTANT: Don't return anything or call showNotification()
  // Firebase SDK will automatically show the notification
});

// ✅ Handle notification clicks
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


// ✅ Enhanced notification click handler with navigation
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  console.log('[SW] Notification data:', event.notification.data);

  event.notification.close();

  const data = event.notification.data;

  // ✅ Build target URL based on notification type
  let targetUrl = '/'; // Default fallback

  if (data) {
    const { type, reviewId, taskId, shiftId } = data;

    // Get companyId from data or use a default
    // Note: You might need to pass companyId in notification data from backend
    const companyId = data.companyId || '24'; // ⚠️ Consider passing this from backend

    console.log('[SW] Notification type:', type);
    console.log('[SW] Review ID:', reviewId);
    console.log('[SW] Company ID:', companyId);

    switch (type) {
      case 'review':
        if (reviewId) {
          targetUrl = `/cleaner-review/${reviewId}?companyId=${companyId}`;
        }
        break;

      case 'task':
        if (taskId) {
          targetUrl = `/tasks/${taskId}?companyId=${companyId}`;
        }
        break;

      case 'shift':
        if (shiftId) {
          targetUrl = `/shifts/${shiftId}?companyId=${companyId}`;
        }
        break;

      default:
        targetUrl = '/dashboard';
        break;
    }
  }

  console.log('[SW] Target URL:', targetUrl);

  // ✅ Open or focus window with target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to find an existing window and focus it
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
              targetUrl: targetUrl
            });
            return client.focus().then(() => {
              // Navigate to target URL
              return client.navigate(targetUrl);
            });
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});


