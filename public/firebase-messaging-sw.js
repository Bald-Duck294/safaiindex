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

// ✅ Handle background messages with custom notification
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  console.log('[SW] Payload:', JSON.stringify(payload, null, 2));

  const title = payload.notification?.title || payload.data?.title || 'New Notification';
  const body = payload.notification?.body || payload.data?.body || '';

  console.log('[SW] Title:', title);
  console.log('[SW] Body:', body);

  // ✅ Use full URL to your logo (deployed version)
  const notificationOptions = {
    body: body,
    icon: 'https://safaiindex.vercel.app/safa_logo.jpeg', // ✅ Use your actual deployed logo
    badge: '', // ✅ Same logo for badge
    data: payload.data || {},
    vibrate: [200, 100, 200],
    tag: payload.data?.reviewId || payload.data?.taskId || 'notification',
    requireInteraction: false,
  };

  console.log('[SW] Showing notification with options:', notificationOptions);

  // ✅ Send to Redux FIRST
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    .then(clients => {
      console.log('[SW] Found', clients.length, 'clients');
      clients.forEach(client => {
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

  // ✅ THEN show notification
  return self.registration.showNotification(title, notificationOptions);
});

// ✅ Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  console.log('[SW] Data:', event.notification.data);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/dashboard';

  if (data.type === 'review' && data.reviewId) {
    targetUrl = `/score-management?reviewId=${data.reviewId}&autoOpen=true`;
  } else if (data.type === 'task' && data.taskId) {
    targetUrl = `/tasks/${data.taskId}`;
  }

  console.log('[SW] Opening:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              data: data,
              targetUrl: targetUrl
            });
            return client.focus().then(() => client.navigate(targetUrl));
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
