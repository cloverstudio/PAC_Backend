import * as types from './types';

import * as login from './login';
import * as notification from './notification';

export function filterTable(filter) {
    return {
        type: types.FILTER,
        filter
    };
}

export {
    login,
    notification
}
