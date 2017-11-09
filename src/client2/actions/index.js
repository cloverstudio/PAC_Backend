import * as types from './types';

import * as login from './login';
import * as notification from './notification';
import * as chatUI from './chatUI';
import * as history from './history';
import * as logout from './logout';
import * as userlist from './userlist';
import * as grouplist from './grouplist';
import * as chat from './chat';

export function filterTable(filter) {
    return {
        type: types.FILTER,
        filter
    };
}

export {
    login,
    notification,
    chatUI,
    history,
    logout,
    grouplist,
    userlist,
    chat
}
