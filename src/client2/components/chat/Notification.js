import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';
import * as strings from '../../lib/strings';
import user from '../../lib/user';

import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';

class Notification extends Component {

    static propTypes = {
    }

    constructor() {
        super();
    }

    toggleNotification = (e) => {
        if (!this.props.notificationState)
            this.props.showNotifications();
        else
            this.props.hideNotifications();
    }

    click(messageId) {

        const message = this.props.notifications.find((message) => {

            return message._id == messageId;

        });

        const user = message.user;
        const group = message.group;
        const room = message.room;

        if (user) {
            this.props.openChatByUser(user);
        }

        if (group) {
            this.props.openChatByGroup(group);
        }

        if (room) {
            this.props.openChatByRoom(room);
        }


    }

    render() {

        let notificationsMenuClass = "dropdown-menu ";
        if (this.props.notificationState)
            notificationsMenuClass += " show";

        let toolbarIcon = "topbar-btn";
        if (this.props.notifications.length > 0)
            toolbarIcon += ' has-new';


        return (
            <li className="dropdown notification">

                <span className={toolbarIcon} onClick={this.toggleNotification}>
                    <i className="fa fa-bell-o"></i>
                </span>

                <div className={notificationsMenuClass}>

                    <div className="media-list media-list-hover media-list-divided media-list-xs">

                        {this.props.notifications.length == 0 ?
                            <a className="media" key="0">
                                <div className="media-body">
                                    <p>
                                        {strings.NotificationNoNotification[user.lang]}
                                    </p>
                                </div>
                            </a> : null
                        }

                        {this.props.notifications.map((message) => {

                            const targetUser = message.user;
                            const group = message.group;
                            const room = message.room;
                            let userClass = "avatar ";
                            let fileId = "";
                            let avatarType = constant.AvatarUser;

                            if (group) {

                                avatarType = constant.AvatarGroup;

                                if (group.avatar && group.avatar.thumbnail) {
                                    fileId = group.avatar.thumbnail.nameOnServer;
                                } else {
                                    fileId = group._id;
                                }

                            }

                            else if (room) {

                                avatarType = constant.AvatarRoom;

                                if (room.avatar && room.avatar.thumbnail) {
                                    fileId = room.avatar.thumbnail.nameOnServer;
                                } else {
                                    fileId = room._id;
                                }

                            }

                            else if (targetUser) {

                                avatarType = constant.AvatarUser;

                                if (targetUser.onlineStatus == 1)
                                    userClass += " status-success";

                                if (targetUser.avatar && targetUser.avatar.thumbnail) {
                                    fileId = targetUser.avatar.thumbnail.nameOnServer;
                                } else {
                                    fileId = targetUser._id;
                                }

                            }

                            let messageText = "";

                            if (message.type == constant.MessageTypeText)
                                messageText = message.message;
                            else if (message.type == constant.MessageTypeFile)
                                messageText = strings.HistoryMessageTypeFile[user.lang];
                            else if (message.type == constant.MessageTypeLocation)
                                messageText = strings.HistoryMessageTypeLocation[user.lang];
                            else if (message.type == constant.MessageTypeContact)
                                messageText = strings.HistoryMessageTypeContact[user.lang];
                            else if (message.type == constant.MessageTypeSticker)
                                messageText = strings.HistoryMessageTypeSticker[user.lang];

                            return <a onClick={() => { this.click(message._id) }} className="media cursor-pointer" key={message._id}>
                                <span className={userClass}>
                                    <AvatarImage fileId={fileId} type={avatarType} />
                                </span>
                                <div className="media-body">
                                    <p>{message.user.name} : {messageText}</p>
                                    <DateTime timestamp={message.created} />
                                </div>
                            </a>
                        })}

                    </div>

                    {this.props.notifications.length != 0 ?

                        <div className="dropdown-footer">
                            <div className="left">
                                <a onClick={this.props.markAll} href="javascript:void(0)" >{strings.NotificationReadAll[user.lang]}</a>
                            </div>

                            <div className="right">
                                <a onClick={this.props.markAll} href="javascript:void(0)" title="Mark all as read">
                                    <i className="fa fa-circle-o"></i>
                                </a>
                            </div>
                        </div> : null

                    }

                </div>

            </li>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        notificationState: state.chatUI.notificationState,
        notifications: state.notification.notifications
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showNotifications: () => dispatch(actions.chatUI.showNotification()),
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        markAll: () => dispatch(actions.history.markAll()),
        openChatByUser: user => dispatch(actions.chat.openChatByUser(user)),
        openChatByGroup: group => dispatch(actions.chat.openChatByGroup(group)),
        openChatByRoom: room => dispatch(actions.chat.openChatByRoom(room)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notification);
