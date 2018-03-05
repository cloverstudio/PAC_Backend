import * as config from "./config";
import * as constant from "./const";
import user from "./user";

export function chatIdByUser(targetUser) {
  let chatId = "";
  let user1 = user.userData;
  let user2 = targetUser;

  if (user1.created < user2.created) {
    chatId = constant.ChatTypePrivate + "-" + user1._id + "-" + user2._id;
  } else {
    chatId = constant.ChatTypePrivate + "-" + user2._id + "-" + user1._id;
  }

  return chatId;
}

export function chatIdByGroup(group) {
  return constant.ChatTypeGroup + "-" + group._id;
}

export function chatIdByRoom(room) {
  return constant.ChatTypeRoom + "-" + room._id;
}

export function getChatIdFromUrl(url) {
  if (url) return url.replace(config.BasePath + "/chat", "").replace("/", "");

  return url;
}

export function getTargetUserIdFromRoomId(roomId) {
  const chunks = roomId.split("-");

  if (chunks.length < 3) return null;

  const user1 = chunks[1];
  const user2 = chunks[2];

  if (user1 == user.userData._id) return user2;
  else return user1;
}

export function getRandomString(length) {
  if (length == undefined) length = 32;

  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export function scrollElemBottom(element) {
  if (element.scrollHeight > element.clientHeight) {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}

export function getScrollBottom(element) {
  return element.scrollHeight - element.scrollTop - element.clientHeight;
}

export function url(url) {
  return config.BasePath + url;
}

export function getTimestamp(dateObj) {
  return `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()} ${
    dateObj.getHours().toString().padLeft(2, '0')
    }:${
    dateObj.getMinutes().toString().padLeft(2, '0')
    }:${
    dateObj.getSeconds().toString().padLeft(2, '0')
    }`;
}

let chatName = "";
export function changeWindowTitle(newChatName) {
  chatName = newChatName;
  updateWindowTitle();
}

let unreadMessage = 0;
export function unreadMessageToWindowTitle(count) {
  unreadMessage = count;
  updateWindowTitle();
}

function updateWindowTitle() {

  document.title = config.AppTitle;

  if (chatName)
    document.title = chatName + " - " + document.title;

  if (unreadMessage > 0)
    document.title = "(" + unreadMessage + ") " + document.title;

}

export function getChatIdByHistory(history) {

  let chatId = "";

  const userFrom = history.user;
  const group = history.group;
  const room = history.room;

  if (history.chatType == constant.ChatTypePrivate) {
    chatId = chatIdByUser(userFrom, user);
  }
  if (history.chatType == constant.ChatTypeGroup) {
    chatId = chatIdByGroup(group);
  }
  if (history.chatType == constant.ChatTypeRoom) {
    chatId = chatIdByRoom(room);
  }

  return chatId;
}
