import { push } from "react-router-redux";

import * as types from "./types";
import * as actions from "../actions";
import { callSearchAll } from "../lib/api/";
import * as strings from "../lib/strings";
import user from "../lib/user";
import { store } from "../index";

export function searchAll(value) {
    return (dispatch, getState) => {
        dispatch({
            type: types.SearchAllStart
        });

        callSearchAll(value)
            .then(data => {
                dispatch({
                    type: types.SearchAllSucceed,
                    data
                });
            })
            .catch(err => {
                console.log(err)
                dispatch(
                    actions.notification.showToast(
                        strings.FailedToSearchUserList[user.lang]
                    )
                );
                dispatch({
                    type: types.SearchAllFailed
                });
            });
    };
}
