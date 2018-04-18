import * as config from './lib/config'
import * as consts from './lib/const';

import viewIcon from './assets/img/fa-eye.png';
import closeIcon from './assets/img/fa-close.png';
import badgeIcon from './assets/img/notification-badge.png';

let cacheName = 'STATIC_ASSETS-v1';

function getTimestamp(dateObj) {
    return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
}

function filterClients(clientsList) {
    return clientsList.filter(client => !client.url.includes('admin') || !client.url.includes('owner'))
}

self.addEventListener('install', function (event) {
    console.log('sw is installing');
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                return cache.addAll(['/', ...serviceWorkerOption.assets])
            }));
});

self.addEventListener('activate', function (event) {

    event.waitUntil(caches.keys()
        .then(keys => {
            console.log('deleting old caches');
            return Promise.all([...keys.map(key => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }), self.clients.claim()])
        }));
})


self.addEventListener('fetch', function (event) {

    if (event.request.method != 'GET') return;

    event.respondWith(
        caches.open(cacheName)
            .then(cache => cache.match(event.request))
            .then(match => match || fetch(event.request))
    );
});

self.addEventListener('push', function (event) {
    //todo: maybe remove checks, already in NotifManager
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const payload = event.data.json();

    const notificationTitle = `${payload.from.name} sent:`;
    const notificationActions = [
        {
            action: 'view',
            title: 'View',
            icon: viewIcon
        },
        {
            action: 'clear',
            title: 'Clear',
            icon: closeIcon
        }
    ];

    const notificationOptions = {
        badge: badgeIcon,
        timestamp: getTimestamp(new Date(payload.message.created)),
        actions: notificationActions,
        body: payload.message.message,
        requireInteraction: true,
        tag: payload.roomId,
        data: payload.roomId,
        icon: config.mediaBaseURL + payload.from.thumb
    }

    event.waitUntil(self.clients.matchAll({
        type: 'window'
    }).then(function (clientList) {

        const filteredClients = filterClients(clientList);

        if (filteredClients.length > 0) {
            if (filteredClients[0].visibilityState !== 'visible' || !filteredClients[0].focused) {

                return self.registration.showNotification(notificationTitle, notificationOptions)
                    .then(() => self.registration.getNotifications())
                    .then(notifications => {
                        const recentNotif = notifications.find(notif => notif.tag === payload.roomId);

                        if (recentNotif) {
                            setTimeout(() => recentNotif.close(), consts.NotificationCloseTimeout);
                        }
                    });
            }
        }
        else {
            return self.registration.showNotification(notificationTitle, notificationOptions);
        }
    }))

})


self.addEventListener('notificationclick', function (event) {

    const roomId = event.notification.data;
    console.log(event);

    if ('actions' in Notification.prototype) {
        if (event.action === 'clear') {
            event.notification.close();
            return;
        }
        openChatWindow(event);
    }
    else {
        openChatWindow(event);
    }

    event.notification.close();

    function openChatWindow(event) {
        event.waitUntil(
            self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {

                const filteredClients = filterClients(clientList);

                if (filteredClients.length > 0) {

                    filteredClients[0].postMessage({
                        action: 'SW_CHANGE_URL',
                        chatId: roomId
                    });

                    filteredClients[0].focus();
                }
                else {
                    self.clients.openWindow(`/chat/${roomId}`);
                }
            })
        )
    }

})