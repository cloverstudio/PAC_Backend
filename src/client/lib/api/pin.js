import api from './api';
import * as config from '../config';
import * as constant from '../const';

export function callPin(state, chatId) {

    return api.post(constant.ApiUrlPin, {
        pin: Number(state),
        chatId
    }).then((response) => {

        return Promise.resolve(response.data);

    });

}