/** Initialize backend API controllers here  */

var express = require('express');
var router = express.Router();
var fs = require('fs')

var bodyParser = require("body-parser");
var _ = require('lodash');

var init = require('../../lib/init.js');

var BackendMain = {

    init: function (app) {

        var self = this;

        router.use("/test", require("./Controllers/TestController").init(app));

        router.use("/avatar", require("./Controllers/Avatar/AvatarController").init(app));

        router.use("/user/signin", require("./Controllers/User/SigninController").init(app));
        router.use("/user/signout", require("./Controllers/User/SignoutController").init(app));
        router.use("/user/signup", require("./Controllers/User/SignupController").init(app));

        router.use("/user/list", require("./Controllers/User/UserListController").init(app));
        router.use("/user/search", require("./Controllers/User/UserSearchController").init(app));
        router.use("/user/update", require("./Controllers/User/UpdateProfileController").init(app));
        router.use("/user/updatepassword", require("./Controllers/User/UpdatePasswordController").init(app));
        router.use("/user/history", require("./Controllers/User/HistoryListController").init(app));
        router.use("/user/history/markall", require("./Controllers/User/MarkAllAsReadController").init(app));
        router.use("/user/history/markchat", require("./Controllers/User/MarkAsReadByChatController").init(app));
        router.use("/user/online", require("./Controllers/User/GetOnlineStatusController").init(app));
        router.use("/user/detail", require("./Controllers/User/UserDetailController").init(app));
        router.use("/user/savepushtoken", require("./Controllers/User/SavePushTokenController").init(app));
        router.use("/user/savewebpushsubscription", require("./Controllers/User/SaveWebPushSubscriptionController").init(app));
        router.use("/user/savevoippushtoken", require("./Controllers/User/SaveVoipPushTokenController").init(app));
        router.use("/user/hooks", require("./Controllers/User/HookListController").init(app));
        router.use("/user/block", require("./Controllers/User/BlockUserController").init(app));
        router.use("/user/mute", require("./Controllers/User/MuteController").init(app));
        router.use("/user/mutelist", require("./Controllers/User/MuteListController").init(app));
        router.use("/user/blocklist", require("./Controllers/User/BlockListController").init(app));
        router.use("/user/sync", require("./Controllers/User/UserSyncContactsController").init(app));
        router.use("/user/updateContacts", require("./Controllers/User/UserUpdateContactsController").init(app));
        router.use("/user/getContacts", require("./Controllers/User/UserGetContactsController").init(app));
        router.use("/user/deleteContact", require("./Controllers/User/UserDeleteContactController").init(app));
        router.use("/user/pin", require("./Controllers/User/PinController").init(app));

        router.use("/room/list/mine", require("./Controllers/Room/RoomListMineController").init(app));
        router.use("/room/new", require("./Controllers/Room/CreateRoomController").init(app));
        router.use("/room/update", require("./Controllers/Room/UpdateRoomController").init(app));
        router.use("/room/leave", require("./Controllers/Room/LeaveRoomController").init(app));
        router.use("/room/detail", require("./Controllers/Room/RoomDetailController").init(app));
        router.use("/room/users", require("./Controllers/Room/RoomUsersController").init(app));
        router.use("/room/users/add", require("./Controllers/Room/AddUsersToRoomController").init(app));
        router.use("/room/users/remove", require("./Controllers/Room/RemoveUsersFromRoomController").init(app));
        router.use("/room/search", require("./Controllers/Room/SearchRoomController").init(app));

        router.use("/group/list", require("./Controllers/Group/GroupListController").init(app));
        router.use("/group/search", require("./Controllers/Group/GroupSearchController").init(app));
        router.use("/group/detail", require("./Controllers/Group/GroupDetailController").init(app));
        router.use("/group/users", require("./Controllers/Group/GroupUsersController").init(app));

        router.use("/message/search", require("./Controllers/Message/SearchMessageController").init(app));
        router.use("/message/favorite/add", require("./Controllers/Message/AddToFavoriteController").init(app));
        router.use("/message/favorite/remove", require("./Controllers/Message/RemoveFromFavoriteController").init(app));
        router.use("/message/favorite/list", require("./Controllers/Message/FavoriteListController").init(app));
        router.use("/message/favorite/list", require("./Controllers/Message/FavoriteListByChatController").init(app));
        router.use("/message/forward", require("./Controllers/Message/ForwardMessageController").init(app));
        router.use("/message/send", require("./Controllers/Message/SendMessageController").init(app));
        router.use("/message/seenby", require("./Controllers/Message/SeenByController").init(app));
        router.use("/message/deliver", require("./Controllers/Message/DeliverMessageController").init(app));

        router.use("/message/list", require("./Controllers/Message/MessageListController").init(app));

        router.use("/file", require("./Controllers/File/FileDownloadController").init(app));
        router.use("/file/upload", require("./Controllers/File/FileUploadController").init(app));

        router.use("/search/all", require("./Controllers/Search/SearchAllController").init(app));
        router.use("/search/historyAndMessages", require("./Controllers/Search/SearchHistoryAndMessagesController").init(app));

        router.use("/stickers", require("./Controllers/Sticker/StickersController").init(app));
        router.use("/sticker", require("./Controllers/Sticker/ShowStickerController").init(app));

        router.use("/hook/in/add", require("./Controllers/WebHook/AddInboundHookController").init(app));
        router.use("/hook/in/update", require("./Controllers/WebHook/UpdateInboundHookController").init(app));
        router.use("/hook/in/remove", require("./Controllers/WebHook/RemoveInboundHookController").init(app));

        router.use("/hook/out/add", require("./Controllers/WebHook/AddOutgoingHookController").init(app));
        router.use("/hook/out/update", require("./Controllers/WebHook/UpdateOutgoingHookController").init(app));
        router.use("/hook/out/remove", require("./Controllers/WebHook/RemoveOutgoingHookController").init(app));

        // webhook receiver
        router.use("/hook/r", require("./Controllers/WebHook/Receiver/WebHookReceiverController").init(app));

        router.use("/lang/get", require("./Controllers/Lang/GetDictionaryController").init(app));

        router.use("/note/save", require("./Controllers/Note/SaveNotesController").init(app));
        router.use("/note/list", require("./Controllers/Note/LoadNotesController").init(app));
        router.use("/note/list", require("./Controllers/Note/NoteListController").init(app));

        router.use("/todo/add", require("./Controllers/Todo/AddTodoController").init(app));
        router.use("/todo/edit", require("./Controllers/Todo/EditTodoController").init(app));
        router.use("/todo/list", require("./Controllers/Todo/TodoListController").init(app));

        return router;
    }
}

module["exports"] = BackendMain;
