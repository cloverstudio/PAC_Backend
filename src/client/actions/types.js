export const FILTER = "FILTER";
export const LocationChange = "@@router/LOCATION_CHANGE";

// Login
export const LoginClick = "Login/Click";
export const LoginFormChangeOrganization = "Login/FormChangeOrganization";
export const LoginFormChangeUsername = "Login/FormChangeUsername";
export const LoginFormChangePassword = "Login/FormChangePassword";
export const LoginFormCheckRemember = "Login/FormCheckRemember";
export const LoginSucceed = "Login/LoginSucceed";
export const LoginFailed = "Login/LoginFailed";

// ChatUI
export const ChatShowNotification = "Chat/ShowNotification";
export const ChatHideNotification = "Chat/HideNotification";
export const ChatShowUsersView = "Chat/ShowUsersView";
export const ChatHideUsersView = "Chat/HideUsersView";
export const ChatShowGroupsView = "Chat/ShowGroupsView";
export const ChatHideGroupsView = "Chat/HideGroupsView";
export const UserInfoTabChange = "Chat/UserInfoTabChange";
export const GroupInfoTabChange = "Chat/GroupInfoTabChange";
export const RoomInfoTabChange = "Chat/RoomInfoTabChange";
export const ChatShowImageView = "Chat/ShowImageView";
export const ChatHideImageView = "Chat/HideImageView";
export const ChatShowMessageInfoView = "Chat/ShowMessageInfoView";
export const ChatHideMessageInfoView = "Chat/HideMessageInfoView";
export const ChatShowStickersView = "Chat/ShowStickersView";
export const ChatHideStickersView = "Chat/HideStickersView";
export const ChatClearChat = "Chat/ClearChat";
export const ChatShowMessageForwardView = "Chat/ShowMessageForwardView";
export const ChatHideMessageForwardView = "Chat/HideMessageForwardView";
export const ChatShowMessageUpdateView = "Chat/ShowMessageUpdateView";
export const ChatHideMessageUpdateView = "Chat/HideMessageUpdateView";

// History
export const HistoryLoadInitial = "History/LoadInitial";
export const HistoryLoadInitialSucceed = "History/LoadInitialSucceed";
export const HistoryLoadInitialFailed = "History/LoadInitialFailed";
export const HistoryLoadStart = "History/LoadStart";
export const HistoryLoadSucceed = "History/LoadSucceed";
export const HistoryLoadFailed = "History/LoadFailed";
export const HistoryMarkAllStart = "History/MarkAllStart";
export const HistoryMarkAllSucceed = "History/MarkAllSucceed";
export const HistoryMarkAllFailed = "History/MarkAllFailed";
export const HistorySearchStart = "History/SearchStart";
export const HistorySearchSucceed = "History/SearchSucceed";
export const HistorySearchFailed = "History/SearchFailed";
export const HistoryTypeKeyword = "History/TypeKeyword";


// UserList
export const UserListLoadStart = "UserList/LoadStart";
export const UserListLoadSucceed = "UserList/LoadSucceed";
export const UserListLoadFailed = "UserList/LoadFailed";
export const UserListSearchSucceed = "UserList/SearchSucceed";

// GroupList
export const GroupListLoadStart = "GroupList/LoadStart";
export const GroupListLoadSucceed = "GroupList/LoadSucceed";
export const GroupListLoadFailed = "GroupList/LoadFailed";
export const GroupListSearchSucceed = "GroupList/SearchSucceed";

// Toast
export const ToastShow = "Toast/Show";
export const ToastHide = "Toast/Hide";

// Logout
export const Logout = "Logout";

// Chat
export const ChatOpenByUser = "Chat/OpenByUser";
export const ChatOpenByGroup = "Chat/OpenByGroup";
export const ChatOpenByRoom = "Chat/OpenByRoom";
export const ChatLoadOldMessagesStart = "Chat/LoadOldMessagesStart";
export const ChatLoadOldMessagesSucceed = "Chat/LoadOldMessagesSucceed";
export const ChatLoadMessageSucceed = "Chat/LoadMessageSucceed";
export const ChatLoadMessageFailed = "Chat/LoadMessageFailed";
export const ChatSendMessage = "Chat/SendMessage";
export const ChatSendMessageInBg = "Chat/SendMessageInBg";
export const ChatReceiveMessage = "Chat/ReceiveMessage";
export const ChatReceiveMessageInChat = "Chat/ReceiveMessageInChat";
export const ChatForwardMessage = "Chat/ForwardMessage";
export const ChatForwardMessageFailed = "Chat/ForwardMessageFailed";
export const ChatUpdateMessages = "Chat/UpdateMessages";
export const ChatLoadMessageStart = "Chat/LoadMessageStart";
export const ChatResetLoadAllToTarget = "Chat/ResetLoadAllToTarget";

export const ChatStartedTyping = "Chat/StartedTyping";
export const ChatStoppedTyping = "Chat/StoppedTyping";
export const ChatSendStartTyping = "Chat/SendStartTyping";
export const ChatSendStopTyping = "Chat/SendStopTyping";
export const ChatShowSidebar = "Chat/ShowSidebar";
export const ChatHideSidebar = "Chat/HideSidebar";
export const ChatShowHistory = "Chat/ShowHistory";
export const ChatHideHistory = "Chat/HideHistory";
export const ChatShowInfoView = "Chat/ShowInfoView";
export const ChatHideInfoView = "Chat/HideInfoView";
export const ChatChangeInputValue = "Chat/ChangeInputValue";
export const ChatAddReplyMessage = "Chat/AddReplyMessage";
export const ChatRemoveReplyMessage = "Chat/RemoveReplyMessage";

export const ChatStartFileUpload = "Chat/StartFileUpload";
export const ChatFileUploadSucceed = "Chat/FileUploadSucceed";
export const ChatFileUploadFailed = "Chat/FileUploadFailed";
export const ChatFileUploadProgress = "Chat/FileUploadProgress";
export const ChatFileUploadAbortSuccess = "Chat/FileUploadAbortSuccess";
export const ChatFileUploadAbortFailed = "Chat/FileUploadAbortFailed";

// Info
export const InfoViewLoadDone = "InfoView/LoadDone";
export const InfoViewLoadMuteState = "InfoView/MuteState";
export const InfoViewLoadBlockState = "InfoView/BlockState";
export const InfoViewLoadMembersSuccess = "InfoView/LoadMembersSuccess";
export const InfoViewLeaveRoomConfirm = "InfoView/LeaveRoomConfirm";
export const InfoViewLeaveRoomStart = "InfoView/LeaveRoomStart";
export const InfoViewLeaveRoomSucceed = "InfoView/LeaveRoomSucceed";
export const InfoViewLeaveRoomFailed = "InfoView/LeaveRoomFailed";
export const InfoViewTogglePinState = "InfoView/TogglePinState";

// Stickers
export const StickersLoadStart = "Stickers/LoadStart";
export const StickersLoadSucceed = "Stickers/LoadSucceed";
export const StickersLoadFailed = "Stickers/LoadFailed";

// create room, edit room
export const RoomSearchUserStart = "Room/SearchUserStart";
export const RoomSearchUserSucceed = "Room/SearchUserSucceed";
export const RoomSearchUserFailed = "Room/SearchUserFailed";
export const RoomAddMember = "Room/AddMember";
export const RoomDeleteMember = "Room/DeleteMember";
export const RoomTypeKeyword = "Room/TypeKeyword";
export const RoomTypeName = "Room/TypeName";
export const RoomTypeDescription = "Room/TypeDescription";
export const RoomSelectFile = "Room/SelectFile";
export const RoomDeleteFile = "Room/DeleteFile";
export const RoomSaveStart = "Room/SaveStart";
export const RoomSaveSucceed = "Room/SaveSucceed";
export const RoomSaveFailed = "Room/SaveFailed";
export const RoomCancel = "Room/Cancel";
export const RoomSelectFileByURL = "Room/SelectFileByURL";
export const RoomInitEditingRoom = "Room/InitEditingRoom";
export const RoomStartEditingRoom = "Room/StartEditingRoom";
export const RoomStartCreatingRoom = "Room/StartCreatingRoom";

// call
export const CallIncoming = "Call/Incoming";
export const CallIncomingMediaReady = "Call/IncomingMediaReady";
export const CallIncomingClose = "Call/IncomingClose";
export const CallIncomingReject = "Call/IncomingReject";
export const CallIncomingAccept = "Call/IncomingAccept";
export const CallOutgoing = "Call/Outgoing";
export const CallOutgoingClose = "Call/OutgoingClose";
export const CallOutgoingFailed = "Call/OutgoingFailed";
export const CallOutgoingStatusChanged = "Call/OutgoingStatusChanged";
export const CallOutgoingConnect = "Call/OutgoingConnect";
export const CallOutgoingAnswered = "Call/OutgoingAnswered";
export const CallClose = "Call/Close";
export const CallFinish = "Call/Finish";
export const CallMute = "Call/Mute";
export const CallUnMute = "Call/UnMute";
export const CallStartVideo = "Call/StartVideo";
export const CallStopVideo = "Call/StopVideo";
export const CallChangeWindowState = "Call/ChangeWindowState";
export const CallIncomingMediaFailed = "Call/IncomingMediaFailed";
export const CallIncomingStatusChanged = "Call/IncomingStatusChanged";

// Search Message
export const SearchMessageStart = "SearchMessage/Start";
export const SearchMessageSuccess = "SearchMessage/Success";
export const SearchMessageFailed = "SearchMessage/Failed";

// Favorite
export const FavoriteLoadMessageStart = "Favorite/LoadMessageStart";
export const FavoriteLoadMessageSuccess = "Favorite/LoadMessageSuccess";
export const FavoriteLoadMessageFailed = "Favorite/LoadMessageFailed";
export const FavoriteRemoveFavorite = "Favorite/RemoveFavorite";
export const FavoriteStartRemoveFavorite = "Favorite/StartRemoveFavorite";
export const FavoriteAddToFavorite = "Favorite/AddFavorite";
export const FavoriteToggleFavorite = "Favorite/ToggleFavorite";

// Proflie
export const ProfileTypeName = "Profile/TypeName";
export const ProfileTypeDescription = "Profile/TypeDescription";
export const ProfileSelectFile = "Profile/SelectFile";
export const ProfileSelectFileByURL = "Profile/SelectFileByURL";
export const ProfileDeleteFile = "Profile/DeleteFile";
export const ProfileSaveStart = "Profile/SaveStart";
export const ProfileSaveSucceed = "Profile/SaveSucceed";
export const ProfileSaveFailed = "Profile/SaveFailed";
export const ProfileSaveValidationError = "Profile/SaveValidationError";

// Password
export const PasswordTypeCurrentPassword = "Password/TypeCurrentPassword";
export const PasswordTypeNewPassword = "Password/TypeNewPasswor";
export const PasswordTypeConfirmPassword = "Password/TypeConfirmPassword";
export const PasswordCancel = "Password/Cancel";
export const PasswordSave = "Password/Save";
export const PasswordSaveValidationError =
    "Password/PasswordSaveValidationError";
export const PasswordSaveStart = "Password/SaveStart";
export const PasswordSaveSucceed = "Password/SaveSucceed";
export const PasswordSaveFailed = "Password/SaveFailed";
export const PasswordLogout = "Password/Logout";

//messageInfo
export const MessageInfoLoadStart = "MessageInfo/LoadStart";
export const MessageInfoLoadSucceed = "MessageInfo/LoadSucceed";
export const MessageInfoLoadFailed = "MessageInfo/LoadFailed";
export const MessageInfoUpdateMessage = "MessageInfo/UpdateMessage";
export const MessageInfoDeleteMessage = "MessageInfo/DeleteMessage";
export const MessageInfoForwardMessage = "MessageInfo/ForwardMessage";

//searchAll
export const SearchAllStart = "SearchAll/Start";
export const SearchAllSucceed = "SearchAll/Succeed";
export const SearchAllFailed = "SearchAll/Failed";

// Note
export const NoteGoEdit = "Note/GoEdit";
export const NoteGoPreview = "Note/GoPreview";
export const NoteTypeNote = "Note/TypeNote";
export const NoteSaveStart = "Note/SaveStart";
export const NoteSaveSucceed = "Note/SaveSucceed";
export const NoteSaveFailed = "Note/SaveFailed";
export const NoteLoadStart = "Note/LoadStart";
export const NoteLoadSucceed = "Note/LoadSucceed";
export const NoteLoadFailed = "Note/LoadFailed";

//userData
export const userDataSignInLoad = "userData/SignInLoad"
export const userDataNewLoad = "userData/NewLoad"