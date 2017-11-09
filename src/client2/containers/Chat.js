import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, Route } from 'react-router-dom';
import { push } from 'react-router-redux'

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

import user from '../lib/user';
import {store} from '../index';

import Toast from '../components/Toast';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import Conversation from '../components/chat/Conversation';
import Information from '../components/chat/Information';
import ReLogin from '../components/ReLogin';

class Main extends Component {

    static propTypes = {
    }

    globalClick = (e) => {

        if(/input/i.test(e.target.tagName)){
            return;
        }

        if(! /topbar-btn|bell/.test(e.target.className))
            this.props.hideNotifications();

        if(! /topbar-btn|fa-user/.test(e.target.className))
            this.props.hideUsersView();
        
        if(! /topbar-btn|fa-users/.test(e.target.className))
            this.props.hideGroupsView();
    }

    componentWillReceiveProps(nextProps){

        if(this.props.location != nextProps.location){
            
            // location update
            const chatId = util.getChatIdFromUrl(nextProps.location);

            if(chatId && chatId.length > 0)
                this.props.loadNewChat(chatId);

        }
    }

    componentDidMount() {
        // location update
        const chatId = util.getChatIdFromUrl(this.props.location);
        
        if(chatId && chatId.length > 0)
            this.props.openChatByChatId(chatId);

    }
    
    render() {
        if(!user.token)
            return <ReLogin />

        return (
            <div className="pace-done sidebar-folded" onClick={this.globalClick}>
                
                <SideBar />
                <Header />

                <main className="layout-chat">

                    <History />

                    <div className="main-content">

                        <Conversation />
                        <Information />

                    </div>

                </main>
                
                <Toast />
                
            </div>
        );
        
    }

}

const mapStateToProps = (state) => {
    return {
        location: state.routing.location.pathname
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
        openChatByChatId: (chatId) => dispatch(actions.chat.openChatByChatId(chatId)),
        loadNewChat: (chatId) => dispatch(actions.chat.loadNewChat(chatId)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Main);
