import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import * as config from '../lib/config';
import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

import user from '../lib/user';
import { store } from '../index';

import Base from './Base';

import Modals from '../components/Modals';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import AvatarImage from '../components/AvatarImage';
import DateTime from '../components/DateTime';

class Favotites extends Base {

    constructor() {
        super();
        this.lastSearchTimeout = null;
        this.page = 1;
        this.chatId = null;
    }

    static propTypes = {
    }

    componentDidMount() {
        this.page = 1;

        const url = this.props.location;
        const chatId = url.replace(config.BasePath + "/favorites", "").replace("/", "");
        console.log("chatId", chatId);

        if (chatId.length > 1)
            this.chatId = chatId;

        this.props.loadMessages(this.page, this.chatId);
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }

    selected = (message) => {

        const chatIdSplit = message.roomID.split("-");
        const chatType = chatIdSplit[0];

        if (chatType == constant.ChatTypePrivate) {
            this.props.openChatByUser(message.userModelTarget);
        }
        else if (chatType == constant.ChatTypeGroup) {
            if (typeof message.group === 'undefined') return this.props.showToast('This group is deleted.')
            else this.props.openChatByGroup(message.group)
        }
        else if (chatType == constant.ChatTypeRoom) {
            if (typeof message.room === 'undefined') return this.props.showToast('This room is deleted.')
            else this.props.openChatByRoom(message.room)
        }

        this.props.loadNewChat(message.roomID, message._id);
    }

    onScroll = (e) => {

        if (this.props.pagingReachesEnd)
            return;

        const scrollPos = window.pageYOffset + 0;
        const realScrollPos = scrollPos + document.body.clientHeight;
        const scrollHeight = document.body.scrollHeight;

        // if scroll position is between 2px from bottom
        if (!this.props.isLoading && Math.abs(realScrollPos - scrollHeight) < 1) {

            this.page++;
            this.props.loadMessages(this.page, this.chatId);

        }
    }

    render() {

        let sideBarClass = "pace-done sidebar-folded";
        if (this.props.sidebarState)
            sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if (this.props.historyBarState)
            asideBarHolderClass += " aside-open";

        return (

            <div className={sideBarClass} onClick={this.globalClick}>

                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>

                    {this.props.isLoading ?
                        <div className="spinner-linear favorite">
                            <div className="line"></div>
                        </div> : null
                    }

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>{strings.FavoriteTitle[user.lang]}</strong>
                                {this.chatId ? <small>{strings.FavoriteTitleFrom[user.lang]}{this.props.chatName}</small> : null}
                            </h1>
                        </div>
                    </header>

                    <div className="main-content favorite">

                        <div className="row">

                            {this.props.favorites.map((favorite) => {

                                const message = favorite.messageModel;

                                if (typeof message.deleted !== 'undefined' && message.deleted !== 0) {
                                    return null;
                                }

                                let chatName = "";

                                if (message.userModelTarget) {
                                    chatName = message.userModelTarget.name;
                                }

                                else if (message.room) {
                                    chatName = message.room.name;
                                }

                                else if (message.group) {
                                    chatName = message.group.name;
                                }

                                else if (message.user) {
                                    chatName = message.user.name;
                                }

                                let chatAvatarId = "";
                                let chatAvatarType = "";

                                if (message.userModelTarget && message.userModelTarget.avatar && message.userModelTarget.avatar.thumbnail) {
                                    chatAvatarId = message.userModelTarget.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarUser;
                                }

                                if (message.room && message.room.avatar && message.room.avatar.thumbnail) {
                                    chatAvatarId = message.room.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarRoom;
                                }

                                if (message.group && message.group.avatar && message.group.avatar.thumbnail) {
                                    chatAvatarId = message.group.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarGroup;
                                }

                                let userName = "";
                                if (message.user)
                                    userName = message.user.name;

                                let userAvatarId = "";
                                if (message.user && message.user.avatar && message.user.avatar.thumbnail)
                                    userAvatarId = message.user.avatar.thumbnail.nameOnServer;


                                let messageContent;

                                switch (message.type) {
                                    case constant.MessageTypeFile:
                                        const [fileMimeType, fileMimeSubtype] = message.file.file.mimeType.split('/')

                                        if (fileMimeType === constant.imgMimeType) {
                                            messageContent = (
                                                <span className="image-message">
                                                    <img className="img-thumbnail" src={config.APIEndpoint + constant.ApiUrlFile + message.file.thumb.id} />
                                                    <br />
                                                    <span className="fw-600">{message.file.file.name}</span>
                                                </span>)
                                        }
                                        else {
                                            messageContent = (
                                                <span>
                                                    <i className="ti-zip text-secondary fs-45 mb-3"></i>
                                                    <br />
                                                    <span className="fw-600">{message.file.file.name}</span>
                                                </span>)
                                        }
                                        break;
                                    case constant.MessageTypeSticker:
                                        messageContent = <img className="favorite-sticker" src={config.mediaBaseURL + message.message} />
                                        break;
                                    case constant.MessageTypeText:
                                        messageContent = message.message;
                                        break;
                                    default:
                                        break;
                                }

                                let deleteIconClass = "ti-trash";
                                if (message._id == this.props.removeConfirmMessageId)
                                    deleteIconClass = "fa fa-check";

                                return <div className="col-md-6 col-xl-4 code code-card code-fold" key={message._id}>
                                    <h6 className="code-title">
                                        <AvatarImage fileId={chatAvatarId} type={chatAvatarType} />
                                        {chatName}
                                        <a onClick={() => { this.props.startRemoveFavorite(message._id) }} href="javascript:void(0)">
                                            <i className={deleteIconClass}></i>
                                        </a>
                                    </h6>

                                    <div className="code-preview" onClick={e => this.selected(message)}>
                                        <div className="media">
                                            <span className="avatar">
                                                <AvatarImage fileId={userAvatarId} type={constant.AvatarUser} />
                                            </span>
                                            <div className="media-body">
                                                <p>
                                                    <strong>{userName}</strong>
                                                </p>

                                                <p className="messsage">
                                                    {messageContent}
                                                </p>

                                                <p className="text-right">
                                                    <DateTime timestamp={message.created} />
                                                </p>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                            })}

                        </div>

                    </div>

                </main>

                <Modals />

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        location: state.routing.location.pathname,
        isLoading: state.favorites.isLoading,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        favorites: state.favorites.favorites,
        pagingReachesEnd: state.favorites.pagingReachesEnd,
        removeConfirmMessageId: state.favorites.removeConfirmMessageId,
        chatName: state.chat.chatName
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
        hideStickersView: () => dispatch(actions.chatUI.hideStickersView()),
        hideSidebar: () => dispatch(actions.chatUI.hideSidebar()),
        hideHistory: () => dispatch(actions.chatUI.hideHistory()),

        loadMessages: (page, chatId) => dispatch(actions.favorites.loadMessages(page, chatId)),
        startRemoveFavorite: (messageId) => dispatch(actions.favorites.startRemoveFavorite(messageId)),

        openChatByUser: (user) => dispatch(actions.chat.openChatByUser(user)),
        openChatByGroup: (group) => dispatch(actions.chat.openChatByGroup(group)),
        openChatByRoom: (room) => dispatch(actions.chat.openChatByRoom(room)),
        loadNewChat: (roomId, messageId) => dispatch(actions.chat.loadNewChat(roomId, messageId, constant.ChatDirectionAllTo)),
        showToast: msg => dispatch(actions.notification.showToast(msg))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Favotites);
