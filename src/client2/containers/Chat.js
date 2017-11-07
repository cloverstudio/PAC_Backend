import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect, Route } from 'react-router-dom';
import { push } from 'react-router-redux'

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';
import {store} from '../index';

import Toast from '../components/Toast';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import Conversation from '../components/chat/Conversation';
import Information from '../components/chat/Information';

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

    componentDidMount() {
        
    }
    
    render() {
        if(!user.token)
            return <Redirect to='/' />

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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Main);
