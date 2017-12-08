import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

import user from '../lib/user';
import {store} from '../index';

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
    }

    static propTypes = {
    }

    componentDidMount() {
        this.page = 1;
        this.props.loadMessages(this.page);
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
    }

    onScroll = (e) => {
        
        if(this.props.pagingReachesEnd)
            return;
            
        const scrollPos = window.pageYOffset + 0;
        const realScrollPos = scrollPos +  document.body.clientHeight;
        const scrollHeight = document.body.scrollHeight;

        // if scroll position is between 2px from bottom
        if(!this.props.isLoading && Math.abs(realScrollPos - scrollHeight) < 1){

            this.page++;
            this.props.loadMessages(this.page);
            
        }
    }

    render() {
        
        let sideBarClass = "pace-done sidebar-folded";
        if(this.props.sidebarState)
            sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if(this.props.historyBarState)
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
                            </h1>
                        </div>
                    </header>

                    <div className="main-content favorite">

                        <div className="row">

                            {this.props.favorites.map( (favorite) => {

                                const message = favorite.messageModel;

                                let chatName = "";

                                if(message.userModelTarget){
                                    chatName = message.userModelTarget.name;
                                }

                                else if(message.room){
                                    chatName = message.room.name;
                                }

                                else if(message.group){
                                    chatName = message.group.name;
                                }

                                else if(message.user){
                                    chatName = message.user.name;
                                }

                                let chatAvatarId = "";
                                let chatAvatarType = "";

                                if(message.userModelTarget && message.userModelTarget.avatar && message.userModelTarget.avatar.thumbnail){
                                    chatAvatarId = message.userModelTarget.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarUser;
                                }

                                if(message.room && message.room.avatar && message.room.avatar.thumbnail){
                                    chatAvatarId = message.room.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarRoom;
                                }

                                if(message.group && message.group.avatar && message.group.avatar.thumbnail){
                                    chatAvatarId = message.group.avatar.thumbnail.nameOnServer;
                                    chatAvatarType = constant.AvatarGroup;
                                }

                                let userName = "";
                                if(message.user)
                                    userName = message.user.name;

                                let userAvatarId = "";
                                if(message.user && message.user.avatar && message.user.avatar.thumbnail)
                                userAvatarId = message.user.avatar.thumbnail.nameOnServer;

                                const messageHightlighted = message.message.replace(this.props.keyword,"<strong>" + this.props.keyword + "</strong>");

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
                                                    <p className="messsage" dangerouslySetInnerHTML={{__html: messageHightlighted}}>
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
        isLoading: state.favorites.isLoading,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        favorites: state.favorites.favorites,
        pagingReachesEnd: state.favorites.pagingReachesEnd
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

        loadMessages: (page) => dispatch(actions.favorites.loadMessages(page)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Favotites);
