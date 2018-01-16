import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';
import { isError } from 'util';

import * as constant from '../lib/const';

const viewState = (state = constant.NotesStatePreview, action) => {
    switch (action.type) {
        case types.NoteGoEdit:
            return constant.NotesStateEdit;
        case types.NoteGoPreview:
            return constant.NotesStatePreview;
        case types.NoteSaveStart:
            return constant.NotesStatePreview;
        case types.ChatOpenByUser:
            return constant.NotesStatePreview
        case types.ChatOpenByGroup:
            return constant.NotesStatePreview
        case types.ChatOpenByRoom:
            return constant.NotesStatePreview

        default:
            return state;
    }
}

const note = (state = "", action) => {
    switch (action.type) {
        case types.NoteTypeNote:
            return action.text;
        case types.NoteLoadSucceed:
            return action.note;

        case types.ChatOpenByUser:
            return ""
        case types.ChatOpenByGroup:
            return ""
        case types.ChatOpenByRoom:
            return ""

        default:
            return state;
    }
}

const loading = (state = false, action) => {
    switch (action.type) {
        case types.NoteSaveStart:
            return true;
        case types.NoteSaveSucceed:
            return false;
        case types.NoteSaveFailed:
            return false;

        case types.NoteLoadStart:
            return true;
        case types.NoteLoadSucceed:
            return false;
        case types.NoteLoadFailed:
            return false;

        default:
            return state;
    }
}


export default combineReducers({
    viewState,
    note,
    loading
});;
