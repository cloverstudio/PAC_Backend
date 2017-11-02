import * as types from './types';

import * as login from './login';
import * as notification from './notification';
import * as main from './main';

export function filterTable(filter) {
    return {
        type: types.FILTER,
        filter
    };
}

export {
    login,
    notification,
    main
}
