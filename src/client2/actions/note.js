import { push, goBack } from 'react-router-redux'

import * as utils from '../lib/utils';

import * as types from './types';
import * as actions from '../actions';
import * as constant from '../lib/const';
import * as config from '../lib/config';
import * as strings from '../lib/strings';
import user from '../lib/user';

import {
    saveNote,
    loadNote
} from '../lib/api/';

import { store } from '../index';


export function edit() {

    return {
        type: types.NoteGoEdit,
        name
    }

}

export function preview() {

    return {
        type: types.NoteGoPreview,
        name
    }

}

export function typeNote(text) {

    return {
        type: types.NoteTypeNote,
        text
    }

}


export function save(chatId, text) {

    return (dispatch, getState) => {

        dispatch({
            type: types.NoteSaveStart
        });

        saveNote(
            chatId,
            text
        )
            .then((note) => {

                dispatch({
                    type: types.NoteSaveSucceed
                });

            }).catch((err) => {

                dispatch({
                    type: types.NoteSaveFailed
                });

            });

    };


}

export function load(chatId, text) {

    return (dispatch, getState) => {

        dispatch({
            type: types.NoteLoadStart
        });

        loadNote(
            chatId
        )
            .then((data) => {

                if (data.note) {
                    dispatch({
                        type: types.NoteLoadSucceed,
                        note: data.note.note
                    });
                } else {
                    dispatch({
                        type: types.NoteLoadSucceed,
                        note: ""
                    });
                }


            }).catch((err) => {

                dispatch({
                    type: types.NoteLoadFailed
                });

            });

    };


}

