export const EN = "EN";

export const ApiUrlTest = "/test";
export const ApiUrlSignin = "/user/signin";
export const ApiUrlSignOut = "/user/signout";
export const ApiUrlGetHistory = "/user/history/";
export const ApiUrlGetUserList = "/user/list/";
export const ApiUrlGetGroupList = "/group/list/";
export const ApiUrlGetUserAvatar = "/avatar/user/";
export const ApiUrlGetGroupAvatar = "/avatar/group/";
export const ApiUrlGetRoomAvatar = "/avatar/room/";
export const ApiUrlMessageList = "/message/list/";
export const ApiUrlGetUserDetail = "/user/detail/";
export const ApiUrlGetGroupDetail = "/group/detail/";
export const ApiUrlGetRoomDetail = "/room/detail/";
export const ApiUrlSearchUserList = "/user/search/";
export const ApiUrlSearchGroupList = "/group/search/";
export const ApiUrlGetStickers = "/stickers";
export const ApiUrlCreateRoom = "/room/new";
export const ApiUrlMute = "/user/mute";
export const ApiUrlBlock = "/user/block";
export const ApiUrlPin = "/user/pin";
export const ApiUrlGetGroupUserList = "/group/users/";
export const ApiUrlGetRoomUserList = "/room/users/";
export const ApiUrlFile = "/file/";
export const ApiUrlFileUpload = "/file/upload";
export const ApiUrlUpdateRoom = "/room/update";
export const ApiUrlAddUserToRoom = "/room/users/add";
export const ApiUrlRemoveUserFromRoom = "/room/users/remove";
export const ApiUrlSearchMessage = "/message/search/";
export const ApiUrlFavorites = "/message/favorite/list/";
export const ApiUrlRemoveFromFavorite = "/message/favorite/remove";
export const ApiUrlAddToFavorite = "/message/favorite/add";
export const ApiUrlForwardMessage = "/message/forward";
export const ApiUrlUpdateProfile = "/user/update";
export const ApiUrlUpdatePassword = "/user/updatepassword";
export const ApiUrlLeaveRoom = "/room/leave";
export const ApiUrlGetMessageInfo = "/message/seenby/";
export const ApiUrlMarkAll = "/user/history/markall";
export const ApiUrlSearchAll = "/search/all/";
export const ApiUrlSaveNote = "/note";
export const ApiUrlLoadNote = "/note";
export const ApiUrlSaveWebPushSubscription = "/user/savewebpushsubscription";

export const ErrorCodeInvalidToken = 4000007;

export const LocalStorageKeyAccessToken = "accesstoken";
export const LocalStorageKeyUserData = "userdata";

export const ChatTypePrivate = 1;
export const ChatTypeGroup = 2;
export const ChatTypeRoom = 3;

export const AvatarUser = "user";
export const AvatarGroup = "group";
export const AvatarRoom = "room";

export const SearchInputTimeout = 300;
export const NotificationCloseTimeout = 4000;
export const TargetMessageResetTimeout = 4000;
export const scrollBoundary = 800;
export const ChatDirectionNew = "new";
export const ChatDirectionOld = "old";
export const ChatDirectionAllTo = "allto";

export const MessageTypeText = 1;
export const MessageTypeFile = 2;
export const MessageTypeLocation = 3;
export const MessageTypeContact = 4;
export const MessageTypeSticker = 5;
export const MessageFileUploading = 10000;

export const ApiDefauleListItemCount = 20;

export const urlRegularExpression = /\bhttps?:\/\/\S+/i;

export const CallFailedUserOffline = 1;
export const CallFailedUserBusy = 2;
export const CallFailedUserReject = 3;
export const CallFailedUserNotSupport = 4;

export const CallTypeOutgoing = 1;
export const CallTypeIncomming = 2;

export const CallMediaTypeAudio = 1;
export const CallMediaTypeVideo = 2;

export const CallWindowStateMax = 1;
export const CallWindowStateMin = 2;

export const imgMimeType = "image";
export const audioMimeType = "audio";
export const appMimeType = "application";
export const pdfMimeSubType = "application/pdf";
export const svgXmlMimeSubtype = "svg+xml";
export const RoomModeCreate = 1;
export const RoomModeEdit = 2;

export const CredentialsMinLength = 6;
export const CredentialsRegex = /^[a-zA-Z0-9]+$/;

export const KeepAliveInterval = 30 * 1000;

export const NotesStatePreview = "Preview"
export const NotesStateEdit = "Edit"

export const NotificationMethodPush = 'Push';
export const NotificationMethodSocket = 'Socket';
export const NotificationOriginPush = 'Push';
export const NotificationOriginSocket = 'Socket';