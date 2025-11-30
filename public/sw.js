/* eslint-disable no-restricted-globals */

// プッシュ通知受信
self.addEventListener('push', function(event) {
  console.log('Push received:', event);

  let data = { title: 'MERRILY', body: '新しい通知があります' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Failed to parse push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: 'merrily-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // 既に開いているタブがあればフォーカス
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいタブを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', function(event) {
  console.log('Background sync:', event);
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // バックグラウンドで通知を同期する処理
    console.log('Syncing notifications...');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
