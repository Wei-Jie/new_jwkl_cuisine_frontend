self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.title || '小灶私廚';
      const options = {
        body: payload.body || '',
        icon: '/pic/chef_mascot_transparent.png',
        badge: '/pic/chef_mascot_transparent.png',
        data: {
          click_action: payload.click_action || '/admin'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      const text = event.data.text();
      event.waitUntil(
        self.registration.showNotification('小灶私廚', {
          body: text,
          icon: '/pic/chef_mascot_transparent.png',
          badge: '/pic/chef_mascot_transparent.png'
        })
      );
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const clickAction = event.notification.data && event.notification.data.click_action
    ? event.notification.data.click_action
    : '/admin';
    
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(function(focusedClient) {
            if (focusedClient.navigate) {
              return focusedClient.navigate(clickAction);
            }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
