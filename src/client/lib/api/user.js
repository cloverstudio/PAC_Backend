import sha1 from 'sha1';

import api from './api';
import * as config from '../config';
import * as constant from '../const';
import user from '../user';

export function callUpdateProfile(
    name,
    description,
    file) {

    const data = new FormData();

    data.append('name', name);
    data.append('description', description);
    data.append('file', file);

    const headers = {
    }

    if (user.token) {
        headers['access-token'] = user.token;
    }

    return fetch(config.APIEndpoint + constant.ApiUrlUpdateProfile,
        {
            method: 'POST',
            body: data,
            mode: 'cors',
            headers: headers
        })
        .then((res) => {

            if (res.status == 200) {
                return res.json();
            } else {
                return res.text();
            }

        }).then((response) => {

            return Promise.resolve(response.data.user);

        });

}

export function callUpdatePassword(currentPassword, newPassword) {


    return api.get(constant.ApiUrlTest).then((response) => {

        if (!response.time)
            return Promise.reject("Failed to login");

        return Promise.resolve(response.time);

    }).then((time) => {

        const tenSec = Math.floor(time / 1000 / 10) + '';
        const key = config.hashSalt + tenSec;
        const secret = sha1(key);
        const passwordHash = sha1(currentPassword + config.hashSalt);

        return api.post(constant.ApiUrlUpdatePassword, {
            currentPassword: passwordHash,
            newPassword: newPassword
        });

    }).then((response) => {

        return Promise.resolve(response.data);

    });

}

export function sendPushSubscription(subscription) {
    console.log('sending web push subs')

    if (!user.userData) return;

    const postData = {
        user: user.userData,
        pushSubscription: subscription
    }

    return api.post(constant.ApiUrlSaveWebPushSubscription, postData)
        .then(response => {

            if (!response.code || response.code != 1) {

                return Promise.reject("Failed to save web push subscription");

            } else {
                return Promise.resolve(response);
            }
        });
}

