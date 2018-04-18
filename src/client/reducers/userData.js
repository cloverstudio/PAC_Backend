import { combineReducers } from 'redux';
import * as types from '../actions/types';
import user from '../lib/user';

const muted = (state = [], action) => {
    switch (action.type) {
        case types.userDataSignInLoad:
            return action.data.muted;

        case types.userDataNewLoad:
            return action.data.user.muted;

        case types.InfoViewLoadMuteState: {
            let oldState = state;
            let newState;

            if (action.state) {
                if (!oldState.includes(action.chatId)) {
                    newState = [...oldState, action.chatId]
                }
                else {
                    return oldState;
                }

            }

            else {
                newState = oldState.filter(chatId => chatId !== action.chatId)
            }

            return newState;
        }
        case types.Logout:
            return [];

        default:
            return state;
    }
};

const wasInitialLoad = (state = false, action) => {
    switch (action.type) {
        case types.userDataSignInLoad:
            return true;
        case types.userDataNewLoad:
            return true;
        case types.Logout:
            return false;
        default:
            return state;
    }
}

export default combineReducers({
    muted,
    wasInitialLoad
});
