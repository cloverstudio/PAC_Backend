import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect, Route } from "react-router-dom";
import { push } from "react-router-redux";

import * as actions from "../actions";

import * as constant from "../lib/const";
import * as strings from "../lib/strings";
import * as util from "../lib/utils";

import Base from "./Base";

import user from "../lib/user";
import { store } from "../index";

import Modals from "../components/Modals";
import SideBar from "../components/chat/SideBar";
import Header from "../components/chat/Header";
import History from "../components/chat/History";
import Conversation from "../components/chat/Conversation";
import Information from "../components/chat/Information";
import ReLogin from "../components/ReLogin";
import MessageInfo from "../components/chat/MessageInfo";

import WindowNotificationManager from '../lib/WindowNotificationManager';


class Main extends Base {
    static propTypes = {};

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isChatLoading) {
            if (this.props.match.params.chatId != nextProps.match.params.chatId) {

                this.props.openChatByChatId(nextProps.match.params.chatId);
            }
        }
    }

    componentDidMount() {
        if (user.token) {
            if (!this.props.isChatLoading) {
                const chatId = this.props.match.params.chatId;
                chatId && chatId.length > 0 ? this.props.openChatByChatId(chatId) : this.props.clearChat();

            }
            if (!this.props.wasInitialUserDataLoaded) {
                this.props.loadNewestUserData();
            }
        }
    }

    render() {
        if (!user.token) return <ReLogin />;
        WindowNotificationManager.init();

        let sideBarClass = "pace-done sidebar-folded";
        if (this.props.sidebarState) sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if (this.props.historyBarState) asideBarHolderClass += " aside-open";

        let globalCssClass = "main-content chat";
        if (this.props.calling && this.props.callingWindowState)
            globalCssClass += " calling";

        return (
            <div className={sideBarClass} onClick={this.globalClick}>
                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>
                    <History />

                    <div className={globalCssClass}>
                        <Conversation />
                        <Information />
                    </div>

                    <MessageInfo />
                </main>

                <Modals />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        location: state.routing.location.pathname,
        timestampByChat: state.chat.timestampByChat,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        calling: state.call.calling,
        callingWindowState: state.call.windowState,
        loadingDirection: state.chat.loadingDirection,
        isChatLoading: state.chat.isLoading,
        wasInitialUserDataLoaded: state.userData.wasInitialLoad
    };
};

const mapDispatchToProps = dispatch => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
        openChatByChatId: chatId =>
            dispatch(actions.chat.openChatByChatId(chatId)),
        loadNewChat: chatId => dispatch(actions.chat.loadNewChat(chatId)),
        clearChat: () => dispatch(actions.chat.clearChat()),
        hideStickersView: () => dispatch(actions.chatUI.hideStickersView()),
        hideSidebar: () => dispatch(actions.chatUI.hideSidebar()),
        hideHistory: () => dispatch(actions.chatUI.hideHistory()),
        hideMessageInfoView: () =>
            dispatch(actions.chatUI.hideMessageInfoView()),
        loadNewestUserData: () => dispatch(actions.userData.loadNewestUserData())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
