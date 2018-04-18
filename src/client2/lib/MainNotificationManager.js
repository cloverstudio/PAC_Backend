import notificationSound from '../assets/sounds/notification.mp3'
import Encryption from './encryption/encryption';
import { store } from '../index';
import user from './user';

import * as constant from './const';
import * as config from './config';
import * as utils from '../lib/utils';

import PushNotificationHandler from './PushNotificationHandler';
import SocketNotificationHandler from './SocketNotificationHandler';

class MainNotificationManager {

    constructor() {
        this.permission = null;

        this.wasInitialised = null;
        this.notificationMethod = null;
        this.wasHandlerInitialised = null;

        this.notificationHandlers = {
            [constant.NotificationMethodPush]: PushNotificationHandler,
            [constant.NotificationMethodSocket]: SocketNotificationHandler
        }

        this.audioElement = new Audio;

    }

    init({ isSaved = false } = {}) {

        if (this.wasInitialised) return;

        console.log('initialising notification manager');

        this.wasInitialised = true;

        if (isSaved && 'PushManager' in window) {
            this.notificationMethod = constant.NotificationMethodPush;
        }
        else {
            this.notificationMethod = constant.NotificationMethodSocket;
        }

        this.askPermission()
            .then(success => {

                this.initNotificationHandler();
            })
            .catch(error => {
                console.error(error);
            })
    }

    askPermission() {

        if (!('Notification' in window)) return Promise.reject('notification is not supported');
        if (this.permission) return Promise.resolve('permission already granted');

        if (Notification.permission !== 'denied') {

            return new Promise((resolve, reject) => {
                try {
                    Notification.requestPermission()
                        .then(permission => {
                            this.permission = permission;
                            if (permission === 'granted') {
                                resolve('Notification permission granted.')
                            }
                            else {
                                reject('Notification permission denied');
                            }
                        })
                }
                catch (error) {
                    //no promise support fallback
                    Notification.requestPermission(permission => {
                        this.permission = permission;
                        if (permission === 'granted') {
                            resolve('Notification permission granted.')
                        }
                        else {
                            reject('Notification permission denied');
                        }
                    })
                }

            })

        }
    }

    initNotificationHandler() {

        this.notificationHandlers[this.notificationMethod].init()
            .then(success => {
                console.log(success);
                this.wasHandlerInitialised = true;
            })
            .catch(error => {
                console.log(this.notificationMethod + ' notif initialisation error', error);
                this.wasHandlerInitialised = false;
            })
    }

    handleNotification(message) {

        if (!this.permission === 'granted'
            || this.notificationMethod !== constant.NotificationMethodSocket) {
            return;
        }
        else {
            this.notificationHandlers[this.notificationMethod].handleMessage(message);
        }

    }

    reset() {
        this.wasInitialised = false;
        this.notificationMethod = false;
        this.wasHandlerInitialised = false;
    }

    disconnect() {
        console.log('disconnecting notificationManager');

        if (this.notificationMethod === constant.NotificationMethodPush) {

            this.notificationHandlers[this.notificationMethod].removeSubscription()
                .then(success => {
                    console.log(success);
                    this.reset();
                })
                .catch(err => {
                    console.error(err);
                    this.reset();
                });
        }
        else {
            this.reset();
        }

    }

}

export default new MainNotificationManager();