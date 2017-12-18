import { routerReducer as routing } from "react-router-redux";
import { combineReducers } from "redux";
import * as types from "../actions/types";

import user from "../lib/user";

const loading = (state = false, action) => {
    switch (action.type) {
        case types.MessageInfoLoadStart:
            return true;
        case types.MessageInfoLoadSucceed:
            return false;
        case types.MessageInfoLoadFailed:
            return false;
        default:
            return state;
    }
};

const selectedMessage = (state = {}, action) => {
    switch (action.type) {
        case types.MessageInfoLoadStart:
            return action.message;

        case types.FavoriteToggleFavorite:
            if (action.messageId === state._id) {
                console.log(state);
                const newState = { ...state };
                newState.isFavorite = action.isFavorite ? 0 : 1;
                return newState;
            }

            return newState;

        case types.MessageInfoDeleteMessage:
            let newState = { ...state };
            newState.deleted = new Date().getTime();
            return newState;
        default:
            return state;
    }
};

const seenBy = (state = [], action) => {
    switch (action.type) {
        case types.MessageInfoLoadSucceed:
            return action.data.seenBy;
        default:
            return state;
    }
};

export default combineReducers({
    loading,
    selectedMessage,
    seenBy
});
