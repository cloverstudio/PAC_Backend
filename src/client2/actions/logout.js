import { push } from "react-router-redux";

import * as types from "./types";
import * as actions from "../actions";

import { callLogin, callLogout } from "../lib/api/";
import * as strings from "../lib/strings";
import * as util from "../lib/utils";
import user from "../lib/user";

import { store } from "../index";

export function onLogout(data) {
    return (dispatch, getState) => {
        callLogout()
            .then(response => {
                dispatch(
                    actions.notification.showToast(strings.LogoutSucceed[user.lang])
                );

                dispatch({
                    type: types.Logout
                });

                dispatch({
                    type: types.ChatClearChat
                })

                user.logout();
                store.dispatch(push(`${util.url("/")}`));
            })
            .catch(err => {

                console.error(err);

                dispatch(
                    actions.notification.showToast(strings.LogoutFailed[user.lang])
                );

                dispatch({
                    type: types.Logout
                });

                user.logout();
                store.dispatch(push(`${util.url("/")}`));
            });
    };
}

export function forceLogout() {

    store.dispatch({
        type: types.Logout
    });

    user.logout();
    store.dispatch(push(`${util.url("/")}`));

}
