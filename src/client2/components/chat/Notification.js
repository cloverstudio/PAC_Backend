import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';

import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';

class Notification extends Component {

    static propTypes = {
    }

    constructor(){
        super();
    }

    toggleNotification = (e) => {
        if(!this.props.notificationState)
            this.props.showNotifications();
        else
            this.props.hideNotifications();
    }

    render() {
        
        let notificationsMenuClass = "dropdown-menu dropdown-menu-right";
        if(this.props.notificationState)
            notificationsMenuClass += " show";

        let toolbarIcon = "topbar-btn";
        if(this.props.notifications.length > 0)
            toolbarIcon += ' has-new';

        return (
            <li className="dropdown notification">
                
                <span className={toolbarIcon} onClick={this.toggleNotification}>
                    <i className="fa fa-bell-o"></i>
                </span>

                <div className={notificationsMenuClass}>

                    <div className="media-list media-list-hover media-list-divided media-list-xs">

                        {this.props.notifications.map( (message) => {

                            const user = message.user;
                            const group = message.group;
                            const room = message.room;
                            let userClass = "avatar ";
                            let fileId = "";
                            let avatarType = constant.AvatarUser;
                            
                            if(group){

                                avatarType = constant.AvatarGroup;

                                if(group.avatar && group.avatar.thumbnail){
                                    fileId = group.avatar.thumbnail.nameOnServer;
                                }

                            }

                            else if(room){

                                avatarType = constant.AvatarRoom;

                                if(room.avatar && room.avatar.thumbnail){
                                    fileId = room.avatar.thumbnail.nameOnServer;
                                }

                            }

                            else if(user){

                                avatarType = constant.AvatarUser;

                                if(user.onlineStatus == 1)
                                    userClass += " status-success";

                                if(user.avatar && user.avatar.thumbnail){
                                    fileId = user.avatar.thumbnail.nameOnServer;
                                }
                                
                            }

                            return <a className="media" key={message._id}>
                                <span className={userClass}>
                                    <AvatarImage fileId={fileId} type={avatarType} />
                                </span>
                                <div className="media-body">
                                <p>{message.user.name} : {message.message}</p>
                                <DateTime timestamp={message.created} />
                                </div>
                            </a>
                        })}

                    </div>

                    <div className="dropdown-footer">
                        <div className="left">
                            <a href="#">Read all notifications</a>
                        </div>

                        <div className="right">
                            <a href="javascript:void(0)" title="Mark all as read">
                                <i className="fa fa-circle-o"></i>
                            </a>
                        </div>

                    </div>

                </div>

            </li>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        notificationState:state.chatUI.notificationState,
        notifications: state.notification.notifications
    };
};

const mapDispatchToProps = (dispatch) => {
    return {       
        showNotifications: () => dispatch(actions.chatUI.showNotification()),
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notification);
