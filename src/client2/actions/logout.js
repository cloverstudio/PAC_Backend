import { push } from "react-router-redux";

import * as types from "./types";
import * as actions from "../actions";

import { callLogin, callLogout } from "../lib/api/";
import * as strings from "../lib/strings";
import user from "../lib/user";

import { store } from "../index";

export function onLogout(data) {
  return (dispatch, getState) => {
    dispatch(actions.notification.showToast(strings.LogoutSucceed[user.lang]));

    callLogout()
      .then(response => {
        dispatch({
          type: types.Logout
        });
      })
      .catch(err => {
        console.error(err);

        dispatch(
          actions.notification.showToast(strings.LogoutFailed[user.lang])
        );

        dispatch({
          type: types.Logout
        });
      });
  };
}
