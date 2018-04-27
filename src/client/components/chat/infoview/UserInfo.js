import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as utils from "../../../lib/utils";
import * as constant from '../../../lib/const';
import * as actions from '../../../actions';
import * as strings from '../../../lib/strings';

import {
    callGetUserDetail
} from '../../../lib/api/';

import user from '../../../lib/user';

import AvatarImage from '../../AvatarImage';
import DateTime from '../../DateTime';

class UserInfo extends Component {

    static propTypes = {
    }

    tabChange = (tabName) => {
        this.props.tabChange(tabName);
    }

    componentDidMount(nextProps) {
        this.updateSwitches();
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.timestampByChat != nextProps.timestampByChat) {

            this.updateSwitches();

        }
    }

    updateSwitches = () => {

        callGetUserDetail(user.userData._id).then((data) => {

            if (!this.props.user)
                return;

            const targetUserId = this.props.user._id;

            this.props.loadDone();

            const blockedUsers = data.user.blocked;
            const mutedChat = data.user.muted;

            if (blockedUsers.indexOf(targetUserId) != -1) {

                this.props.loadBlockState(true);

            } else {

                this.props.loadBlockState(false);

            }

            if (mutedChat.indexOf(targetUserId) != -1) {

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

    tuggleBlock = () => {

        this.props.updateBlockState(!this.props.blocked);
        this.props.loadBlockState(!this.props.blocked);

    }

    videoCall = () => {

        this.props.makeOutgoingCall({
            user: this.props.user,
            mediaType: constant.CallMediaTypeAudio
        })

    }

    voiceCall = () => {

        this.props.makeOutgoingCall({
            user: this.props.user,
            mediaType: constant.CallMediaTypeVideo
        })

    }

    openFavorites = () => {

    }

    render() {

        let cnTabGeneral = "nav-link ";
        let cnTabDetail = "nav-link ";

        let cnTabContentGeneral = "tab-pane fade show  mt-12 pr-12";
        let cnTabContentDetail = "tab-pane fade show bg-white";

        if (this.props.tabState == 'options') {
            cnTabGeneral += " active";
            cnTabContentGeneral += " active";
        }

        if (this.props.tabState == 'detail') {
            cnTabDetail += " active";
            cnTabContentDetail += " active";
        }

        // get last login
        let lastlogin = 0;

        if (this.props.user && this.props.user.token) {
            const lastToken = this.props.user.token[this.props.user.token.length - 1];
            if (lastToken)
                lastlogin = lastToken.generateAt;
        }

        let isPinned = this.props.pinnedChatIDs.includes(this.props.user._id);

        return (

            <div>

                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info cursor-pointer">
                    <li className="nav-item" onClick={() => { this.tabChange("options") }}  >
                        <a className={cnTabGeneral}>{strings.InfoViewUserDetailOptions[user.lang]}</a>
                    </li>
                    <li className="nav-item" onClick={() => { this.tabChange("detail") }}   >
                        <a className={cnTabDetail}>{strings.InfoViewUserDetailDetail[user.lang]}</a>
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

                        <div className="media">
                            <button className="btn btn-label btn-primary btn-block" onClick={this.voiceCall}><label><i className="ti-video-camera"></i></label>{strings.InfoViewUserDetailVideoCall[user.lang]}</button>
                        </div>

                        <div className="media">
                            <button className="btn btn-label btn-info btn-block" onClick={this.videoCall}><label><i className="ti-headphone-alt"></i></label>{strings.InfoViewUserDetailVoiceCall[user.lang]}</button>
                        </div>

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

                        <div className="media">
                            <div className="media-body">
                                <p><strong>{strings.InfoViewUserDetailBlock[user.lang]}</strong></p>
                                {this.props.blocked ?
                                    <p>{strings.InfoViewTextBlockedExplanation[user.lang]}</p> : null
                                }
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" checked={this.props.blocked} onClick={this.tuggleBlock} />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                        <div className="media">
                            <div className="media-body">
                                <p><strong>{strings.InfoViewUserDetailPin[user.lang]}</strong></p>
                                {isPinned ?
                                    <p>{strings.InfoViewTextPinnedExplanation[user.lang]}</p> : null
                                }
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox"
                                    checked={isPinned}
                                    onClick={() => this.props.togglePin(!isPinned)} />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                    </div>

                    <div className={cnTabContentDetail}>

                        <div className="quickview-block form-type-material">

                            <div className="form-group do-float">
                                <span className="form-control">{this.props.user.name}</span>
                                <label>{strings.InfoViewUserDetailName[user.lang]}</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">{this.props.user.description}&nbsp;</span>
                                <label>{strings.InfoViewUserDetailDescription[user.lang]}</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">
                                    <DateTime timestamp={lastlogin} />
                                </span>
                                <label>{strings.InfoViewUserDetailLastLogin[user.lang]}</label>
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
        tabState: state.chatUI.userInfoTabState,
        user: state.infoView.user,
        chatId: state.chat.chatId,
        timestampByChat: state.chat.timestampByChat,
        blocked: state.infoView.blocked,
        muted: state.infoView.muted,
        pinnedChatIDs: state.history.pinnedChatIDs
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        tabChange: tabName => dispatch(actions.chatUI.tabChangedUserInfo(tabName)),
        loadDone: () => dispatch(actions.infoView.loadDone()),
        loadMuteState: (state) => dispatch(actions.infoView.loadMuteState(state)),
        loadBlockState: (state) => dispatch(actions.infoView.loadBlockState(state)),
        showError: (err) => dispatch(actions.notification.showToast(err)),
        updateMuteState: (state) => dispatch(actions.infoView.updateMuteState(state, constant.ChatTypePrivate)),
        updateBlockState: (state) => dispatch(actions.infoView.updateBlockState(state)),
        makeOutgoingCall: (callObj) => dispatch(actions.call.outgoingCall(callObj)),
        togglePin: newState => dispatch(actions.infoView.togglePin(newState))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserInfo);
