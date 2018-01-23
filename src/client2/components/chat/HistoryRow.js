import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import loginUser from '../../lib/user';
import * as strings from '../../lib/strings';
import * as utils from '../../lib/utils';
import * as actions from '../../actions';

import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';


class HistoryRow extends Component {

    static propTypes = {
    }

    constructor() {
        super();
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.history != nextProps.history) {


        }
    }

    selected = () => {

        if (this.props.history.chatType == constant.ChatTypePrivate) {
            this.props.openChatByUser(this.props.history.user);
        }
        else if (this.props.history.chatType == constant.ChatTypeGroup) {
            this.props.openChatByGroup(this.props.history.group);
        }
        else if (this.props.history.chatType == constant.ChatTypeRoom) {
            this.props.openChatByRoom(this.props.history.room);
        }

    }

    render() {

        const history = this.props.history;

        let fileId = "";

        const user = history.user;
        const group = history.group;
        const room = history.room;
        let userClass = "avatar ";

        if (user && user.avatar && user.avatar.thumbnail) {
            fileId = user.avatar.thumbnail.nameOnServer;
        } else if (user)
            fileId = user._id;

        if (user && user.onlineStatus == 1)
            userClass += " status-success";

        if (group && group.avatar && group.avatar.thumbnail) {
            fileId = group.avatar.thumbnail.nameOnServer;
        } else if (group)
            fileId = group._id;

        if (room && room.avatar && room.avatar.thumbnail) {
            fileId = room.avatar.thumbnail.nameOnServer;
        } else if (room)
            fileId = room._id;

        let lastMessage = "";

        if (history.lastMessage) {

            if (history.lastMessage.type == constant.MessageTypeText)
                lastMessage = history.lastMessage.message;
            else if (history.lastMessage.type == constant.MessageTypeFile)
                lastMessage = strings.HistoryMessageTypeFile[loginUser.lang];
            else if (history.lastMessage.type == constant.MessageTypeLocation)
                lastMessage = strings.HistoryMessageTypeLocation[loginUser.lang];
            else if (history.lastMessage.type == constant.MessageTypeContact)
                lastMessage = strings.HistoryMessageTypeContact[loginUser.lang];
            else if (history.lastMessage.type == constant.MessageTypeSticker)
                lastMessage = strings.HistoryMessageTypeSticker[loginUser.lang];

        }


        let messageClass = "text-truncate";
        if (history.unreadCount > 0)
            messageClass += " bold";

        let lastUpdateUserName = "";

        if (history.lastUpdateUser) {

            lastUpdateUserName = history.lastUpdateUser.name;
            if (history.lastUpdateUser._id == loginUser.userData._id)
                lastUpdateUserName = strings.HistoryYou[loginUser.lang];

            lastUpdateUserName += " : ";
        }

        let rowClass = "history-row";

        // get chatId from history.chatId
        const originalChatId = this.props.history.chatId;
        let chatId = "";

        if (this.props.history.chatType == constant.ChatTypePrivate) {
            chatId = utils.chatIdByUser(user, loginUser);
        }
        if (this.props.history.chatType == constant.ChatTypeGroup) {
            chatId = utils.chatIdByGroup(group);
        }
        if (this.props.history.chatType == constant.ChatTypeRoom) {
            chatId = utils.chatIdByRoom(room);
        }

        if (this.props.selectedChatId == chatId) {

            rowClass += " selected";

        }

        return (
            <div className={rowClass} onClick={this.selected}>

                {history.chatType == constant.ChatTypePrivate ?
                    <div className={"media align-items-center"}>
                        <span className={userClass}>
                            <AvatarImage fileId={fileId} type={constant.AvatarUser} />
                        </span>
                        <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">{user.name}</strong>
                                <DateTime timestamp={history.lastUpdate} />
                                {history.unreadCount > 0 ?
                                    <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                    : null
                                }
                            </div>
                            <p className={messageClass}>
                                {lastUpdateUserName} {lastMessage}
                            </p>
                        </div>
                    </div> : null
                }

                {history.chatType == constant.ChatTypeGroup ?
                    <div className="media align-items-center">
                        <span className="avatar">
                            <AvatarImage fileId={fileId} type={constant.AvatarGroup} />
                        </span>
                        <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">{group.name}</strong>
                                <DateTime timestamp={history.lastUpdate} />
                                {history.unreadCount > 0 ?
                                    <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                    : null
                                }
                            </div>
                            <p className={messageClass}>
                                {lastUpdateUserName} {lastMessage}
                            </p>
                        </div>
                    </div> : null
                }

                {history.chatType == constant.ChatTypeRoom ?
                    <div className="media align-items-center">
                        <span className="avatar">
                            <AvatarImage fileId={fileId} type={constant.AvatarRoom} />
                        </span>
                        <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">{room.name}</strong>
                                <DateTime timestamp={history.lastUpdate} />
                                {history.unreadCount > 0 ?
                                    <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                    : null
                                }
                            </div>
                            <p className={messageClass}>
                                {lastUpdateUserName} {lastMessage}
                            </p>
                        </div>
                    </div> : null
                }
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        selectedChatId: state.chat.chatId,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        openChatByUser: user => dispatch(actions.chat.openChatByUser(user)),
        openChatByGroup: group => dispatch(actions.chat.openChatByGroup(group)),
        openChatByRoom: room => dispatch(actions.chat.openChatByRoom(room)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HistoryRow);
