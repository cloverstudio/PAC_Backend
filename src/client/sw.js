import "babel-polyfill";
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

const handleNotification = async function (notificationTitle, notificationOptions) {

    const clientList = await self.clients.matchAll({
        type: 'window'
    });

    const filteredClients = filterClients(clientList);

    const existingNotifications = await self.registration.getNotifications({
        tag: notificationOptions.tag
    });

    let updatedOptions = notificationOptions;

    if (existingNotifications[0]) {

        const messageBody = existingNotifications[0].body;
        let splitMessages = messageBody.split('\n');

        splitMessages.push(notificationOptions.body);
        if (splitMessages.length == 6) splitMessages.shift();

        updatedOptions.body = splitMessages.join('\n');
    }

    if (filteredClients.length > 0) {

        if (filteredClients[0].visibilityState !== 'visible'
            || !filteredClients[0].focused) {

            const newNotification = await self.registration.showNotification(notificationTitle, updatedOptions);
            if (!notificationOptions.silent) {

                filteredClients[0].postMessage({
                    action: 'NOTIFICATION_PLAY_SOUND'
                });
            }

            const visibleExistingNotifications = await self.registration.getNotifications({
                tag: notificationOptions.tag
            });
            if (visibleExistingNotifications[0]) {

                setTimeout(() => visibleExistingNotifications[0].close(), consts.NotificationCloseTimeout);
            }
            return newNotification;
        }
    }
    else {
        return await self.registration.showNotification(notificationTitle, updatedOptions);
    }
}

self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const payload = event.data.json();
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

    let iconImage = config.mediaBaseURL;
    let notificationTitle;
    let message;

    if (payload.group) {
        iconImage += payload.group.thumb;
        notificationTitle = payload.group.name;
    }
    else if (payload.room) {
        iconImage += payload.room.thumb;
        notificationTitle = payload.room.name;

    }
    else {
        iconImage += payload.from.thumb;
        notificationTitle = `${payload.from.name} sent:`

    }

    if (payload.message.type === consts.MessageTypeFile) {
        message = 'a file.';
    }
    else if (payload.message.type === consts.MessageTypeSticker) {
        message = 'a sticker.';
    }
    else {
        message = payload.message.message;
    }

    if (payload.group || payload.room) {
        message = payload.from.name + ': ' + message;
    }

    const notificationOptions = {
        badge: badgeIcon,
        timestamp: getTimestamp(new Date(payload.message.created)),
        actions: notificationActions,
        body: message,
        requireInteraction: true,
        tag: payload.roomId,
        data: payload.roomId,
        icon: iconImage,
        silent: payload.mute
    }

    event.waitUntil(handleNotification(notificationTitle, notificationOptions));

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
