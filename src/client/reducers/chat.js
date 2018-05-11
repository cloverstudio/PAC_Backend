import { routerReducer as routing } from "react-router-redux";
import { combineReducers } from "redux";

import user from "../lib/user";
import * as constant from "../lib/const";
import * as types from "../actions/types";
import * as utils from "../lib/utils";

const initial = {
    chatAvatar: {
        type: null,
        fileId: null,
        name: null
    },
    isLoading: false,
    messageList: [],
    chatId: "",
    chatType: null,
    typing: {},
    timestampByChat: 0,
    inputValues: {},
    replies: {},
    loadingDirection: null,
    loadAllToTarget: null,
    chatName: ""
};

const chatName = (state = initial.chatName, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return action.user.name
        case types.ChatOpenByGroup:
            return action.group.name
        case types.ChatOpenByRoom:
            return action.room.name
        case types.ChatClearChat:
            return initial.chatName;
        default:
            return state;
    }
};

const timestampByChat = (state = initial.timestampByChat, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return new Date().getTime();
        case types.ChatOpenByGroup:
            return new Date().getTime();
        case types.ChatOpenByRoom:
            return new Date().getTime();
        default:
            return state;
    }
};

const chatId = (state = initial.chatId, action) => {
    switch (action.type) {
        case types.LocationChange:
            let chatId = utils.getChatIdFromUrl(action.payload.pathname);
            if (chatId) {
                if (chatId !== state) {
                    return chatId
                }
                return state;

            }
            return state;
        case types.ChatOpenByUser:
            return action.chatId;
        case types.ChatOpenByGroup:
            return action.chatId;
        case types.ChatOpenByRoom:
            return action.chatId;
        case types.ChatClearChat:
            return "";
        default:
            return state;
    }
};

const chatType = (state = initial.chatType, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return constant.ChatTypePrivate;
        case types.ChatOpenByGroup:
            return constant.ChatTypeGroup;
        case types.ChatOpenByRoom:
            return constant.ChatTypeRoom;
        case types.ChatClearChat:
            return initial.chatType;

        default:
            return state;
    }
};

const currentChatUser = (state = initial.currentChatUser, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return action.user;
        case types.ChatOpenByGroup:
            return null;
        case types.ChatOpenByRoom:
            return null;
        case types.ChatClearChat:
            return null;

        default:
            return state;
    }
};

const chatAvatar = (state = initial.chatAvatar, action) => {
    const oldState = state;
    const newState = oldState;

    if (action.type == types.ChatOpenByUser) {
        const user = action.user;

        newState.type = constant.AvatarUser;
        newState.fileId = "";

        if (user && user.avatar && user.avatar.thumbnail)
            newState.fileId = user.avatar.thumbnail.nameOnServer;
        else if (user)
            newState.fileId = user._id;

        newState.name = user.name;
    } else if (action.type == types.ChatOpenByGroup) {
        const group = action.group;

        newState.type = constant.AvatarGroup;
        newState.fileId = "";

        if (group && group.avatar && group.avatar.thumbnail)
            newState.fileId = group.avatar.thumbnail.nameOnServer;
        else if (group)
            newState.fileId = group._id;

        newState.name = group.name;
    } else if (action.type == types.ChatOpenByRoom) {
        const room = action.room;

        newState.type = constant.AvatarRoom;
        newState.fileId = "";

        if (room && room.avatar && room.avatar.thumbnail)
            newState.fileId = room.avatar.thumbnail.nameOnServer;
        else if (room)
            newState.fileId = room._id;

        newState.name = room.name;
    }

    if (action.type == types.ChatClearChat) return initial.chatAvatar;

    return Object.assign({}, newState);
};

const isLoading = (state = initial.isLoading, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return true;
        case types.ChatOpenByGroup:
            return true;
        case types.ChatOpenByRoom:
            return true;
        case types.ChatLoadMessageStart:
            return true;
        case types.ChatLoadMessageSucceed:
            return false;
        case types.ChatLoadMessageFailed:
            return false;
        case types.ChatLoadOldMessagesStart:
            return true;
        case types.ChatLoadOldMessagesSucceed:
            return false;
        case types.ChatClearChat:
            return false;
        default:
            return state;
    }
};

const messageList = (state = initial.messageList, action) => {
    const oldState = state;
    let newState = oldState;

    if (
        action.type == types.ChatOpenByUser ||
        action.type == types.ChatOpenByGroup ||
        action.type == types.ChatOpenByRoom
    ) {
        newState = [];
    }

    if (action.type == types.ChatLoadMessageSucceed) {
        newState = action.messages;
    }

    if (action.type === types.ChatLoadOldMessagesSucceed) {
        newState = action.messages.reverse().concat(oldState);
    }

    if (action.type === types.ChatSendMessage) {
        newState = oldState.concat(action.message);
    }

    if (action.type === types.ChatReceiveMessage) {
        if (!action.currentChat) return state;

        if (action.message.userID === user.userData._id) {
            let myMessageIndex = oldState.findIndex(
                message => message.localID === action.message.localID
            );

            if (myMessageIndex > -1) {
                return oldState.map((msg, i) => {
                    if (i === myMessageIndex) {
                        return action.message;
                    } else return msg;
                });
            }
            else {
                newState = oldState.concat(action.message);
            }
        } else {
            newState = oldState.concat(action.message);
        }
    }

    if (action.type === types.ChatStartFileUpload) {
        newState = oldState.concat({
            localID: action.localFileId,
            userID: action.userID,
            created: action.created,
            type: action.MsgType
        });
    }

    if (action.type === types.ChatFileUploadSucceed) {
        let myMessageIndex = -1;
        for (let i = oldState.length - 1; i > -1; i--) {
            if (oldState[i].localID === action.localFileId) {
                myMessageIndex = i;
                break;
            }
        }
        if (myMessageIndex > -1) {
            newState = oldState.filter((msg, i) => i !== myMessageIndex);
        }
    }

    if (action.type === types.ChatFileUploadAbortSuccess) {
        newState = oldState.filter(msg => msg.localID !== action.localID);

    }

    if (action.type == types.ChatClearChat) return initial.messageList;

    if (action.type === types.MessageInfoDeleteMessage) {
        let myMessageIndex = oldState.findIndex(
            message => action.messageID === message._id
        );

        if (myMessageIndex > -1) {
            return oldState.map((msg, i) => {
                if (
                    i === myMessageIndex &&
                    typeof msg.deleted === "undefined"
                ) {
                    let deleted = { ...msg };
                    deleted.message = "";
                    deleted.deleted = new Date().getTime();
                    return deleted;
                }
                return msg;
            });
        }
    }

    if (action.type === types.FavoriteToggleFavorite) {
        let myMessageIndex = oldState.findIndex(
            message => action.messageId === message._id
        );

        if (myMessageIndex > -1) {
            return oldState.map((msg, i) => {
                if (i === myMessageIndex) {
                    let targetMessage = { ...msg };
                    targetMessage.isFavorite = action.isFavorite ? 0 : 1;
                    return targetMessage;
                }
                return msg;
            });
        }
    }

    if (action.type === types.ChatUpdateMessages) {
        if (oldState.length > 0) {
            const currentChatId = oldState[0].roomID;
            const currentChatUpdatedMsgs = action.updatedMessages.filter(msg => msg.roomID === currentChatId);

            if (currentChatUpdatedMsgs.length > 0) {

                const currentChatUpdatedMsgsIndexes = currentChatUpdatedMsgs.map(msg => oldState.findIndex(oldMsg => oldMsg._id === msg._id))

                return oldState.map((oldMsg, i) => {
                    let msgToReplaceIndex = currentChatUpdatedMsgsIndexes.indexOf(i)
                    if (msgToReplaceIndex > -1) {
                        return {
                            ...oldMsg,
                            ...currentChatUpdatedMsgs[msgToReplaceIndex]
                        }
                    }
                    else {
                        return oldMsg
                    }
                })
            }

        }
    }

    return newState;
};

const typing = (state = initial.typing, action) => {
    switch (action.type) {
        case types.ChatOpenByUser:
            return {};
        case types.ChatOpenByGroup:
            return {};
        case types.ChatOpenByRoom:
            return {};
        case types.ChatStartedTyping:
            return { ...state, [action.userID]: action.userName };
        case types.ChatStoppedTyping:
            const newState = { ...state };
            delete newState[action.userID];
            return newState;
        default:
            return state;
    }
};

const inputValues = (state = initial.inputValues, action) => {
    switch (action.type) {
        case types.ChatChangeInputValue:
            const newState = { ...state };
            newState[action.chatId] = action.value;
            return newState;
        default:
            return state;
    }
};

const replies = (state = initial.replies, action) => {
    switch (action.type) {
        case types.ChatAddReplyMessage: {
            const newState = { ...state };
            newState[action.chatId] = action.replyMessage;
            return newState;
        }
        case types.ChatRemoveReplyMessage: {
            const newState = { ...state };
            newState[action.chatId] = null;
            return newState;
        }
        case types.ChatSendMessage: {
            const newState = { ...state };
            if (state[action.message.roomID]) {
                newState[action.message.roomID] = null;
            }
            return newState;
        }
        default:
            return state;
    }
}

const loadingDirection = (state = initial.loadingDirection, action) => {
    switch (action.type) {
        case types.ChatLoadMessageStart:
            return action.loadingDirection;
        case types.ChatLoadOldMessagesSucceed:
            return constant.ChatDirectionOld;
        case types.ChatLoadMessageSucceed:
            return null;
        default:
            return state;
    }
}

const loadAllToTarget = (state = initial.loadAllToTarget, action) => {
    switch (action.type) {
        case types.ChatLoadMessageStart:
            if (action.loadingDirection === constant.ChatDirectionAllTo) {
                return action.messageId
            }
            else {
                return null;
            }
        case types.ChatResetLoadAllToTarget:
            return null;
        default:
            return state;
    }
}

export default combineReducers({
    chatAvatar,
    isLoading,
    messageList,
    chatId,
    chatType,
    typing,
    timestampByChat,
    inputValues,
    loadingDirection,
    loadAllToTarget,
    chatName,
    replies
});
