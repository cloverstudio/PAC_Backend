import * as constant from './const';
import SocketManager from './SocketManager';
import { store } from '../index';
import * as types from '../actions/types';
import MainNotificationManager from './MainNotificationManager';
import PushNotificationHandler from './PushNotificationHandler';

class user {

    constructor() {
        this.lang = constant.EN;
        this.userData = null;
        this.userInitialised = null;

        const checkLocalStorage = localStorage.getItem(constant.LocalStorageKeyAccessToken);

        if (checkLocalStorage) {

            this.userData = JSON.parse(localStorage.getItem(constant.LocalStorageKeyUserData));
            this.token = localStorage.getItem(constant.LocalStorageKeyAccessToken);

            MainNotificationManager.init({
                isSaved: true
            });

            setTimeout(() => {
                SocketManager.init();
            }, 100);

        }
    }

    signinSucceed(signinData, save) {
        this.userData = signinData.user;
        this.token = signinData.newToken;

        SocketManager.init();

        store.dispatch({
            type: types.userDataSignInLoad,
            data: signinData.user
        })

        if (save) {
            localStorage.setItem(constant.LocalStorageKeyAccessToken, signinData.newToken);
            localStorage.setItem(constant.LocalStorageKeyUserData, JSON.stringify(signinData.user));

        } else {
            localStorage.removeItem(constant.LocalStorageKeyAccessToken);
            localStorage.removeItem(constant.LocalStorageKeyUserData);
        }

        MainNotificationManager.init({
            isSaved: save
        });
    }

    updateUserData(userData) {
        this.userData = userData;

        const checkLocalStorage = localStorage.getItem(constant.LocalStorageKeyUserData);

        if (checkLocalStorage) {
            const savedUserData = JSON.parse(checkLocalStorage);

            if (savedUserData && savedUserData._id == userData._id)
                localStorage.setItem(constant.LocalStorageKeyUserData, JSON.stringify(userData));
        }

    }

    checkSavedToken() {

    }

    logout() {

        this.userData = null;
        this.token = null;

        localStorage.removeItem(constant.LocalStorageKeyAccessToken);
        localStorage.removeItem(constant.LocalStorageKeyUserData);

        MainNotificationManager.disconnect();

        SocketManager.disconnect();
    }
}

export default new user();