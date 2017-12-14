import * as types from './types';

import * as login from './login';
import * as notification from './notification';
import * as chatUI from './chatUI';
import * as history from './history';
import * as logout from './logout';
import * as userlist from './userlist';
import * as grouplist from './grouplist';
import * as chat from './chat';
import * as infoView from './infoView';
import * as stickers from './stickers';
import * as room from './room';
import * as call from './call';
import * as searchMessage from './searchMessage';
import * as favorites from './favorites';
import * as profile from './profile';
import * as password from './password';
import * as messageInfo from './messageInfo';

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
    chat,
    stickers,
    room,
    infoView,
    call,
    searchMessage,
    favorites,
    profile,
    password,
    messageInfo
}
