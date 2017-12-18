export { callLogin } from "./login";

export { callGetHistory, callMarkAll } from "./history";

export { callGetUserList, callSearchUserList } from "./userlist";

export {
    callGetGroupList,
    callSearchGroupList,
    callGroupUserList
} from "./group";

export { callGetMessageList } from "./chat";

export {
    callGetUserDetail,
    callGetGroupDetail,
    callGetRoomDetail
} from "./getDetail";

export { callGetStickers } from "./stickers";

export {
    callCreateRoom,
    callRoomUserList,
    callUpdateRoom,
    callAddMemberToRoom,
    callRemoveUserFromRoom,
    callLeaveRoom
} from "./room";

export { callMute } from "./mute";

export { callBlock } from "./block";

export { fileUploadWrapper } from "./upload";

export {
    callSearchMessage,
    callLoadFavorites,
    callRemoveFromFavorite,
    callAddToFavorite,
    callGetMessageInfo,
    callForwardMessage
} from "./message";

export { callUpdateProfile, callUpdatePassword } from "./user";

export { callSearchAll } from "./searchAll";
