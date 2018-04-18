import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { store } from '../index';

const paging = (state = 1, action) => {
    switch (action.type) {
        case types.FavoriteLoadMessageStart:
            return action.page;
        default:
            return state;
    }
};

const favorites = (state = [], action) => {

    if (action.type == types.FavoriteLoadMessageSuccess) {

        const page = store.getState().favorites.paging;

        if (page == 1)
            return action.messages;

        else
            return state.concat(action.messages);

    }


    if (action.type == types.FavoriteRemoveFavorite) {

        const messageId = action.messageId;

        return state.filter((message) => {
            return message.messageId != messageId;
        });

    }

    if (action.type === types.Logout) {
        return [];
    }

    return state;

};

const pagingReachesEnd = (state = false, action) => {
    switch (action.type) {
        case types.FavoriteLoadMessageSuccess:
            return action.messages.length < 20;
        default:
            return state;
    }
};


const isLoading = (state = false, action) => {
    switch (action.type) {
        case types.FavoriteLoadMessageStart:
            return true;
        case types.FavoriteLoadMessageSuccess:
            return false;
        case types.FavoriteLoadMessageFailed:
            return false;
        default:
            return state;
    }
};

const removeConfirmMessageId = (state = null, action) => {
    switch (action.type) {
        case types.FavoriteStartRemoveFavorite:
            return action.messageId
        default:
            return state;
    }
};

export default combineReducers({
    pagingReachesEnd,
    paging,
    favorites,
    isLoading,
    removeConfirmMessageId
});;
