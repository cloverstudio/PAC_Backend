import sha1 from 'sha1';

import api from './api';
import * as config from '../config';
import * as constant from '../const';
import user from '../user';

export function saveNote(
    chatId,
    note) {

    return api.post(constant.ApiUrlSaveNote, {
        chatId: chatId,
        note: note
    })
        .then((response) => {

            if (!response.code || response.code != 1) {
                return Promise.reject("Failed save note.");
            }
            else {
                return Promise.resolve(response.data);
            }

        });
}


export function loadNote(
    chatId) {

    return api.get(constant.ApiUrlLoadNote + "/" + chatId)
        .then((response) => {

            if (!response.code || response.code != 1) {
                return Promise.reject("Failed to get note.");
            }
            else {
                return Promise.resolve(response.data);
            }

        });
}


