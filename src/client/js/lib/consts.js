
var Const = {};

Const.responsecodeSucceed = 1;
Const.responsecodeUnknownError = 4000000;
Const.responsecodeTokenInvalid = 4000007;

Const.ErrorCodes = {
        4000000 : "Unknown Error",
        4000001 : "Please input userid.",
        4000002 : "Please input password.",
        4000003 : "Organization id is wrong.",
        4000004 : "Wrong secret.",
        4000005 : "Organization id is wrong.",
        4000006 : "Wrong userid or password.",
        4000007 : "Invalid token.",
        4000008 : "Invalid name",
        4000009 : "Invalid file.",
        4000010 : "Wrong current password.",
        4000011 : "Invalid new password.",
        4000012 : "Wrong room id.",
        4000013 : "Wrong room name.",
        4000014 : "Wrong file type.",
        4000015 : "Invalid room id",
        4000016 : "Invalid user id",
        4000017 : "Invalid user id.",
        4000018 : "Invalid group id.",
        4000019 : "Invalid room id.",
        4000020 : "Invalid message id.",
        4000021 : "Invalid message id.",
        4000022 : "The message is already in favorite.",
        4000023 : "Invalid message id.",
        4000024 : "Invalid message id.",
        4000025 : "Wrong room id",
        4000026 : "Wrong user id",
        4000027 : "Wrong room id",
        4000028 : "Wrong user id",
        4000029 : "Invalid chat id",
        4000030 : "Invalid message id",
        4000057 : "You can't add more rooms.",
        4000067 : "You have no permission.",
        4999999 : ""              
},
     
Const.NotificationUpdateWindowSize = "NotificationUpdateWindowSize";

Const.LocalStorageKeyUserId = 'ls_userid';
Const.LocalStorageKeyPassword = 'ls_password';
Const.LocalStorageKeyOrganization = 'ls_organization';
Const.LocalStorageKeyRemember = 'ls_remember';
Const.LocalStorageKeyNotification = "ls_notification";
Const.LocalStorageKeyTemporaryUserId = "ls_temporary_user_id";

Const.chatTypePrivate = 1;
Const.chatTypeGroup = 2;
Const.chatTypeRoom = 3;

Const.credentialsMinLength = 6;

Const.NotificationUpdateHeader = "notification_update_header";
Const.NotificationRefreshHistory = "notification_refresh_history";
Const.NotificationRefreshUser = "notification_refresh_user";
Const.NotificationRefreshGroup = "notification_refresh_group";
Const.NotificationShowSearch = "notification_show_search";
Const.NotificationShowFavorite = "notification_show_favorite";
Const.NotificationCustomHeader  = "notification_show_customhader";
Const.NotificationUpdateUnreadCount = "notification_update_unreadcount";
Const.NotificationShowWebHook = "notification_show_webhook";
Const.NotificationOpenChat = "notification_open_chat";
Const.NotificationRemoveRoom = "notification_remove_room";
Const.NotificationSelectMessage = "notification_select_message";
Const.NotificationStartCalling = "notification_startcalling";
Const.NotificationCallFaild = "notification_callfailed";
Const.NotificationCallRequest = "notification_callrequest";
Const.NotificationCallCancel = "notification_callcancel";
Const.NotificationCallRejectMine = "notification_rejectmine";
Const.NotificationCallReceived = "notification_callreceived";
Const.NotificationCallAnswer = "notification_callanswer";
Const.NotificationCallClose = "notification_callclose";
Const.NotificationDeletedFromGroup = "notification_deleted_from_group"

Const.hookTypeInbound = 1;
Const.hookTypeOutgoing = 2;

Const.callTypeOutgoing = 1;
Const.callTypeIncomming = 2;

Const.callMediaTypeAudio = 1;
Const.callMediaTypeVideo = 2;

Const.callFailedUserOffline = 1;
Const.callFailedUserBusy = 2;
Const.callFailedUserReject = 3;
Const.callFailedUserNotSupport = 4;

// Exports ----------------------------------------------
module["exports"] = Const;