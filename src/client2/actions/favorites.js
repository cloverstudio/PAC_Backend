import { push } from "react-router-redux";

import * as types from "./types";
import * as actions from "../actions";
import {
    callGetUserList,
    callSearchUserList,
    callLoadFavorites,
    callRemoveFromFavorite,
    callAddToFavorite
} from "../lib/api/";
import * as strings from "../lib/strings";
import user from "../lib/user";
import { store } from "../index";
import { type } from "os";

export function loadMessages(page) {
    return (dispatch, getState) => {
        dispatch({
            type: types.FavoriteLoadMessageStart,
            page
        });

        callLoadFavorites(page)
            .then(data => {
                dispatch({
                    type: types.FavoriteLoadMessageSuccess,
                    messages: data.favorites
                });
            })
            .catch(err => {
                console.error(err);

                dispatch(
                    actions.notification.showToast(
                        strings.FailedToLoadFavorites[user.lang]
                    )
                );

                dispatch({
                    type: types.FavoriteLoadMessageFailed
                });
            });
    };
}

export function startRemoveFavorite(messageId) {
    return (dispatch, getState) => {
        if (getState().favorites.removeConfirmMessageId == messageId) {
            dispatch(removeFavorite(messageId));
        } else {
            dispatch({
                type: types.FavoriteStartRemoveFavorite,
                messageId
            });
        }
    };
}

export function removeFavorite(messageId) {
    return (dispatch, getState) => {
        dispatch({
            type: types.FavoriteRemoveFavorite,
            messageId
        });

        callRemoveFromFavorite(messageId)
            .then(data => {})
            .catch(err => {
                console.error(err);

                dispatch(
                    actions.notification.showToast(
                        strings.FailedToRemoveFromFavorites[user.lang]
                    )
                );
            });
    };
}

export function toggleFavorite(messageId, isFavorite) {
    return (dispatch, getState) => {
        dispatch({
            type: types.FavoriteToggleFavorite,
            messageId,
            isFavorite
        });
        isFavorite
            ? callRemoveFromFavorite(messageId)
                  .then(data => {})
                  .catch(err => {
                      console.error(err);

                      dispatch(
                          actions.notification.showToast(
                              strings.FailedToRemoveFromFavorites[user.lang]
                          )
                      );
                  })
            : callAddToFavorite(messageId)
                  .then(data => {})
                  .catch(err => {
                      console.error(err);

                      dispatch(
                          actions.notification.showToast(
                              strings.FailedToAddToFavorites[user.lang]
                          )
                      );
                  });
    };
}
