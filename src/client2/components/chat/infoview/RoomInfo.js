import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as actions from '../../../actions';
import * as strings from '../../../lib/strings';
import * as utils from '../../../lib/utils';
import user from '../../../lib/user';

import {
    callGetUserDetail
} from '../../../lib/api/';

import AvatarImage from '../../AvatarImage';
import DateTime from '../../DateTime';

class RoomInfo extends Component {

    static propTypes = {
    }

    tabChange = (tabName) => {
        this.props.tabChange(tabName);
    }


    componentDidMount(nextProps) {
        this.updateSwitches();
        this.props.loadMembers();
    }


    componentWillReceiveProps(nextProps) {

        if (this.props.timestampByChat != nextProps.timestampByChat) {
            this.updateSwitches();
            this.props.loadMembers();
        }

    }

    updateSwitches = () => {

        callGetUserDetail(user.userData._id).then((data) => {

            if (!this.props.room)
                return;

            const roomId = this.props.room._id;

            this.props.loadDone();

            const mutedChat = data.user.muted;

            if (mutedChat.indexOf(roomId) != -1) {
                this.props.loadMuteState(true);
            } else {
                this.props.loadMuteState(false);
            }

        }).catch((err) => {

            console.error(err);
            this.props.showError(strings.InfoViewFailedToGetDetail[user.lang]);

        });

    }

    tuggleMute = () => {

        this.props.updateMuteState(!this.props.muted);
        this.props.loadMuteState(!this.props.muted);

    }

    openNewChat = (user, chatLink) => {
        if (user.isCurrentUser) return;
        this.props.openChat(user);
        this.props.loadChatMessages(chatLink);
        this.props.changeCurrentChat(chatLink);
    }

    render() {
        let isUserOwner = (this.props.room.owner == user.userData._id)

        let cnTabGeneral = "nav-link ";
        let cnTabDetail = "nav-link ";
        let cnTabMembers = "nav-link ";

        let cnTabContentGeneral = "tab-pane fade show ";
        let cnTabContentDetail = "tab-pane fade show bg-white";
        let cnTabContentMembers = "tab-pane fade show bg-white";

        if (this.props.tabState == 'options') {
            cnTabGeneral += " active";
            cnTabContentGeneral += " active";
        }

        if (this.props.tabState == 'detail') {
            cnTabDetail += " active";
            cnTabContentDetail += " active";
        }

        if (this.props.tabState == 'members') {
            cnTabMembers += " active";
            cnTabContentMembers += " active";
        }

        const members = this.props.members;
        members.sort((obj1, obj2) => {

            if (obj1._id == this.props.room.owner) {
                obj1.onlineStatus = 10;
            }

            if (obj2._id == this.props.room.owner) {
                obj2.onlineStatus = 10;
            }

            return -1 * (obj1.onlineStatus - obj2.onlineStatus);
        });

        const membersModified = members.map((member) => {

            member.isCurrentUser = member._id == user.userData._id;
            member.isOwner = false;

            if (member._id == this.props.room.owner) {
                member.isOwner = true;
            }

            return member;

        });

        return (
            <div>

                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info cursor-pointer">
                    <li className="nav-item" onClick={() => { this.tabChange("options") }}>
                        <a className={cnTabGeneral}>{strings.InfoViewUserDetailOptions[user.lang]}</a>
                    </li>
                    <li className="nav-item" onClick={() => { this.tabChange("detail") }}>
                        <a className={cnTabDetail}>{strings.InfoViewUserDetailDetail[user.lang]}</a>
                    </li>
                    <li className="nav-item" onClick={() => { this.tabChange("members") }}>
                        <a className={cnTabMembers}>{strings.InfoViewUserDetailMembers[user.lang]}</a>
                    </li>
                </ul>

                <div className="tab-content">

                    <div className={cnTabContentGeneral}>

                        <div className="media">
                            <Link to={`${utils.url("/note/" + this.props.chatId)}`} className="btn btn-label btn-primary btn-block">
                                <label><i className="ti-agenda"></i></label>{strings.InfoViewNotes[user.lang]}
                            </Link>
                        </div>

                        <div className="media">
                            <Link to={`${utils.url("/favorites/" + this.props.chatId)}`} className="btn btn-label btn-primary btn-block">
                                <label><i className="ti-heart"></i></label>{strings.SidebarFavorite[user.lang]}
                            </Link>
                        </div>

                        {isUserOwner ?
                            <div className="media">
                                <Link to={`${utils.url('/editroom/' + this.props.room._id)}`} className="btn btn-label btn-primary btn-block"><label><i className="ti-pencil"></i></label> Edit Room</Link>
                            </div>
                            :
                            null
                        }

                        {this.props.confirmRoomId == this.props.room._id ?

                            <div className="media">
                                {user.userData._id == this.props.room.owner ?
                                    <button onClick={() => { this.props.deleteRoom(this.props.room._id) }} className="btn btn-label btn-primary btn-danger btn-block">
                                        <label><i className="ti-close"></i></label>{strings.InfoViewLeaveRoomConfirm[user.lang]}
                                    </button>
                                    :
                                    <button onClick={() => { this.props.leaveRoom(this.props.room._id) }} className="btn btn-label btn-primary btn-danger btn-block">
                                        <label><i className="ti-close"></i></label>{strings.InfoViewLeaveRoomConfirm[user.lang]}
                                    </button>
                                }
                            </div>

                            :

                            <div className="media">
                                {user.userData._id == this.props.room.owner ?
                                    <button onClick={() => { this.props.deleteRoomConfirm(this.props.room._id) }} className="btn btn-label btn-primary btn-danger btn-block">
                                        <label><i className="ti-close"></i></label>{strings.InfoViewDeleteRoom[user.lang]}
                                    </button>
                                    :
                                    <button onClick={() => { this.props.leaveRoomConfirm(this.props.room._id) }} className="btn btn-label btn-primary btn-danger btn-block">
                                        <label><i className="ti-close"></i></label>{strings.InfoViewLeaveRoom[user.lang]}
                                    </button>
                                }
                            </div>
                        }

                        <div className="media">
                            <div className="media-body">
                                <p><strong>{strings.InfoViewUserDetailNotification[user.lang]}</strong></p>
                                {this.props.muted ?
                                    <p>{strings.InfoViewTextMutedExplanation[user.lang]}</p> : null
                                }
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" checked={this.props.muted} onClick={this.tuggleMute} />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                    </div>

                    <div className={cnTabContentDetail}>

                        <div className="quickview-block form-type-material">

                            <div className="form-group do-float">
                                <span className="form-control">{this.props.room.name}</span>
                                <label>{strings.InfoViewUserDetailName[user.lang]}</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">{this.props.room.description}&nbsp;</span>
                                <label>{strings.InfoViewUserDetailDescription[user.lang]}</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">
                                    <DateTime timestamp={this.props.room.created} />
                                </span>
                                <label>{strings.InfoViewCreated[user.lang]}</label>
                            </div>

                        </div>

                    </div>

                    <div className={cnTabContentMembers}>

                        <div className="quickview-block form-type-material">

                            <div className="media-list media-list-hover">

                                {membersModified.map(member => {

                                    let fileId = null;

                                    if (member.avatar && member.avatar.thumbnail)
                                        fileId = member.avatar.thumbnail.nameOnServer;
                                    else
                                        fileId = member._id;

                                    let classname = " avatar ";
                                    if (member.onlineStatus)
                                        classname += " status-success";

                                    let userChatLink = utils.chatIdByUser(member);

                                    return (
                                        <div className="media media-single media-action-visible cursor-pointer"
                                            onClick={() => this.openNewChat(member, userChatLink)}
                                            key={member._id}>

                                            <span className={classname}>
                                                <AvatarImage className="status-success" fileId={fileId} type={constant.AvatarUser} />
                                            </span>
                                            <p className="title">
                                                {member.isOwner ?
                                                    <strong className=""><span className="fa fa-flag text-yellow"></span> {member.name}</strong> :
                                                    <span>{member.name}</span>
                                                }
                                            </p>
                                            {member.isCurrentUser
                                                ? null
                                                : <span className="media-action">
                                                    <i className="fa fa-comment"></i>
                                                </span>}

                                        </div>)

                                })}

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        tabState: state.chatUI.roomInfoTabState,
        room: state.infoView.room,
        timestampByChat: state.chat.timestampByChat,
        muted: state.infoView.muted,
        members: state.infoView.members,
        confirmRoomId: state.infoView.confirmRoomId,
        chatId: state.chat.chatId,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        tabChange: tabName => dispatch(actions.chatUI.tabChangedRoomInfo(tabName)),
        loadDone: () => dispatch(actions.infoView.loadDone()),
        loadMuteState: (state) => dispatch(actions.infoView.loadMuteState(state)),
        showError: (err) => dispatch(actions.notification.showToast(err)),
        updateMuteState: (state) => dispatch(actions.infoView.updateMuteState(state, constant.ChatTypeRoom)),
        loadMembers: () => dispatch(actions.infoView.loadMembers()),
        openChat: user => dispatch(actions.chat.openChatByUser(user)),
        deleteRoomConfirm: roomId => dispatch(actions.infoView.deleteRoomConfirm(roomId)),
        leaveRoomConfirm: roomId => dispatch(actions.infoView.leaveRoomConfirm(roomId)),
        deleteRoom: roomId => dispatch(actions.infoView.deleteRoom(roomId)),
        leaveRoom: roomId => dispatch(actions.infoView.leaveRoom(roomId)),
        loadChatMessages: (chatId) => dispatch(actions.chat.loadChatMessages(chatId)),
        changeCurrentChat: chatId => dispatch(actions.chat.changeCurrentChat(chatId))

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RoomInfo);
