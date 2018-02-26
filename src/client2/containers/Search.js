import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';
import * as config from '../lib/config';

import user from '../lib/user';
import { store } from '../index';

import Base from './Base';

import Modals from '../components/Modals';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import AvatarImage from '../components/AvatarImage';
import DateTime from '../components/DateTime';

class Search extends Base {

    constructor() {
        super();
        this.lastSearchTimeout = null;
    }

    static propTypes = {
    }

    selected = (message) => {

        const chatIdSplit = message.roomID.split("-");
        const chatType = chatIdSplit[0];

        if (chatType == constant.ChatTypePrivate) {
            this.props.openChatByUser(message.userModelTarget);
        }
        else if (chatType == constant.ChatTypeGroup) {
            this.props.openChatByGroup(message.group);
        }
        else if (chatType == constant.ChatTypeRoom) {
            this.props.openChatByRoom(message.room);
        }

        this.props.loadChatMessages(message.roomID, message._id);
        this.props.changeCurrentChat(message.roomID);

    }

    onKeywordChange = (e) => {
        e.persist();

        if (this.lastSearchTimeout)
            clearTimeout(this.lastSearchTimeout);

        this.lastSearchTimeout = setTimeout(() => {
            if (e.target.value.trim().length > 0)
                this.props.searchMessage(e.target.value)
        }, constant.SearchInputTimeout);
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

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>{strings.SearchTitle[user.lang]}</strong>
                            </h1>
                            <div className="input-group">
                                <span className="input-group-addon" id="basic-addon1">
                                    <i className="ti-search"></i></span>
                                <input onChange={this.onKeywordChange} type="text" className="form-control" />
                            </div>
                        </div>
                    </header>

                    {this.props.isLoading ?
                        <div className="spinner-linear search">
                            <div className="line"></div>
                        </div> : null
                    }

                    <div className="main-content search">

                        <div className="row">

                            {this.props.searchResult.map((message) => {

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

                                if (message.type === constant.MessageTypeText) {
                                    const messageHightlighted = message.message.replace(new RegExp('(' + this.props.keyword + ')', 'i'), "<strong>$1</strong>");

                                    const regEx = /(<strong>.*<\/strong>)/g;
                                    const messageSplit = messageHightlighted.split(regEx)

                                    if (messageSplit.length === 3) {
                                        messageSplit[1] = <strong key="keyword">{messageSplit[1].slice(8, -9)}</strong>
                                    }
                                    messageContent = messageSplit
                                }
                                else if (message.type === constant.MessageTypeFile) {

                                    const titleHighlighted = message.file.file.name.replace(new RegExp('(' + this.props.keyword + ')', 'i'), "<strong>$1</strong>");
                                    const [fileMimeType, fileMimeSubtype] = message.file.file.mimeType.split('/')

                                    if (fileMimeType === constant.imgMimeType) {
                                        messageContent = (
                                            <span className="image-message">
                                                <img className="img-thumbnail" src={config.APIEndpoint + constant.ApiUrlFile + message.file.thumb.id} />
                                                <br />
                                                <span className="fw-600" dangerouslySetInnerHTML={{ __html: titleHighlighted }}></span>
                                            </span>)
                                    }
                                    else {
                                        messageContent = (
                                            <span>
                                                <i className="ti-zip text-secondary fs-45 mb-3"></i>
                                                <br />
                                                <span className="fw-600" dangerouslySetInnerHTML={{ __html: titleHighlighted }}></span>
                                            </span>)
                                    }
                                }

                                return <div className="col-md-6 col-xl-4 code code-card code-fold" key={message._id}
                                    onClick={e => this.selected(message)}>
                                    <h6 className="code-title">
                                        <AvatarImage fileId={chatAvatarId} type={chatAvatarType} />
                                        {chatName}
                                    </h6>

                                    <div className="code-preview">
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
        isLoading: state.searchMessage.isLoading,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        searchResult: state.searchMessage.searchResult,
        keyword: state.searchMessage.keyword
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

        searchMessage: (keyword) => dispatch(actions.searchMessage.searchMessage(keyword)),
        openChatByUser: (user) => dispatch(actions.chat.openChatByUser(user)),
        openChatByGroup: (group) => dispatch(actions.chat.openChatByGroup(group)),
        openChatByRoom: (room) => dispatch(actions.chat.openChatByRoom(room)),
        loadChatMessages: (roomId, messageId) => dispatch(actions.chat.loadChatMessages(roomId, messageId, constant.ChatDirectionAllTo)),
        changeCurrentChat: chatId => dispatch(actions.chat.changeCurrentChat(chatId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
