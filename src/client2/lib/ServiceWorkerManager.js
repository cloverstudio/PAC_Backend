import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import * as config from './config';

import { store } from '../index';
import { chat } from '../actions';

class ServiceWorkerManager {

    constructor() {
        this.getRegistration = new Promise(function (resolve, reject) {
            if (!('serviceWorker' in navigator)) {
                reject('Service Worker is not supported');
            }
            else {

                //start sw event listeners
                navigator.serviceWorker.addEventListener('message', event => {

                    if (event.data.action === 'SW_CHANGE_URL') {
                        store.dispatch(chat.changeCurrentChat(event.data.chatId))
                    }

                })

                runtime.register().then(registration => resolve(registration))
            }

        });
    }

}

export default new ServiceWorkerManager();