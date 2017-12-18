import { routerReducer as routing } from "react-router-redux";
import { combineReducers } from "redux";
import * as types from "../actions/types";

import login from "./login";
import toast from "./toast";
import chatUI from "./chatUI";
import history from "./history";
import userlist from "./userlist";
import grouplist from "./grouplist";
import chat from "./chat";
import infoView from "./infoview";
import stickers from "./stickers";
import room from "./room";
import call from "./call";
import files from "./files";
import imageView from "./imageView";
import searchMessage from "./searchMessage";
import favorites from "./favorites";
import profile from "./profile";
import password from "./password";
import notification from "./notification";
import messageInfo from "./messageInfo";
import messageForward from "./messageForward";

const filter = (state = "", action) => {
    switch (action.type) {
        case types.FILTER:
            return action.filter;
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    login,
    toast,
    filter,
    routing,
    chatUI,
    history,
    userlist,
    grouplist,
    chat,
    infoView,
    stickers,
    call,
    files,
    imageView,
    room,
    call,
    searchMessage,
    favorites,
    profile,
    password,
    notification,
    messageInfo,
    messageForward
});

export default rootReducer;
