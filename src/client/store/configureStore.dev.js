import createHistory from 'history/createBrowserHistory';
import { applyMiddleware, createStore, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk'

import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';

import SocketManager from '../lib/SocketManager';

export const history = createHistory();

const middleware = routerMiddleware(history);

const logger = store => next => action => {

    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())

    if (!action.type)
        return;

    return result
}

export function configureStore(initialState) {
    return createStore(
        rootReducer,
        initialState,
        compose(
            applyMiddleware(middleware,
                logger,
                thunkMiddleware,
                SocketManager.actionListener),
            DevTools.instrument()
        )
    );
}
