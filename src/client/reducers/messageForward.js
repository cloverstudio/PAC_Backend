import { routerReducer as routing } from "react-router-redux";
import { combineReducers } from "redux";
import * as types from "../actions/types";

const loading = (state = false, action) => {
    switch (action.type) {
        case types.SearchAllStart:
            return true;
        case types.SearchAllSucceed:
            return false;
        case types.SearchAllFailed:
            return false;
        default:
            return state;
    }
};

const searchResults = (state = [], action) => {
    switch (action.type) {
        case types.SearchAllSucceed:
            return action.data.list;
        case types.SearchAllFailed:
            return [];
        default:
            return state;
    }
};

export default combineReducers({
    loading,
    searchResults
});
