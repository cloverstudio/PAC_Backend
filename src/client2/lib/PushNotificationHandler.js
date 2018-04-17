import *  as userAPI from './api/user';
import * as config from './config';
import * as utils from './utils';
import * as constant from './const';

import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import ServiceWorkerManager from './ServiceWorkerManager';

class PushNotificationHandler {

    constructor() {
        this.pushSubscription = null;
        this.subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: utils.urlBase64ToUint8Array(config.vapidPublicKey)
        }
    }

    init = () => {

        return new Promise((resolve, reject) => {

            ServiceWorkerManager.getRegistration.then(registration => {

                registration.pushManager.getSubscription()
                    .then(existingPushSubscription => {

                        if (!existingPushSubscription) {

                            registration.pushManager.subscribe(this.subscribeOptions)
                                .then(newPushSubscription => {

                                    userAPI.sendPushSubscription(newPushSubscription)
                                        .then(response => {

                                            this.pushSubscription = newPushSubscription;

                                            resolve(newPushSubscription);

                                        })
                                })

                        }
                        else {
                            this.pushSubscription = existingPushSubscription;
                            resolve(existingPushSubscription);
                        }
                    })

            })
                .catch(registrationErr => {

                    console.error('SW registration error', registrationErr);
                    reject(error);

                })

        })

    }

    removeSubscription = () => {
        if (this.pushSubscription) {

            return new Promise((resolve, reject) => {

                this.pushSubscription.unsubscribe()
                    .then(success => {
                        resolve('unsubscription successful');
                    })
                    .catch(err => {
                        reject(err);
                    })
            })

        }
    }

}

export default new PushNotificationHandler();