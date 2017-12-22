import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

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

class Search extends Base {

    constructor() {
        super();
        this.lastSearchTimeout = null;
    }

    static propTypes = {
    }

    onKeywordChange = (e) => {
        e.persist();

        if (this.lastSearchTimeout)
            clearTimeout(this.lastSearchTimeout);

        this.lastSearchTimeout = setTimeout(() => {
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

                                const messageHightlighted = message.message.replace(this.props.keyword, "<strong>" + this.props.keyword + "</strong>");

                                return <div className="col-md-6 col-xl-4 code code-card code-fold" key={message._id}>
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
                                                <p className="messsage" dangerouslySetInnerHTML={{ __html: messageHightlighted }}>
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Search);
