import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as actions from '../../../actions';
import * as strings from '../../../lib/strings';
import user from '../../../lib/user';

import {
    callGetUserDetail
} from '../../../lib/api/';

import AvatarImage from '../../AvatarImage';
import DateTime from '../../DateTime';

class GroupInfo extends Component {

    static propTypes = {
    }

    tabChange = (tabName) => {
        this.props.tabChange(tabName);
    }

    componentDidMount(nextProps){
        this.updateSwitches();
        this.props.loadMembers();
    }
    
    componentWillReceiveProps(nextProps){
        if(this.props.timestampByChat != nextProps.timestampByChat){
            this.updateSwitches();
            this.props.loadMembers();
        }
    }
    
    updateSwitches = () =>{

        callGetUserDetail(user.userData._id).then( (data) => {
            
            if(!this.props.group)
                return;

            const groupId = this.props.group._id;

            this.props.loadDone();

            const mutedChat = data.user.muted;
            
            if(mutedChat.indexOf(groupId) != -1){
                this.props.loadMuteState(true);
            }else{
                this.props.loadMuteState(false);
            }
            
        }).catch( (err) => {

            console.error(err);
            this.props.showError(strings.InfoViewFailedToGetDetail[user.lang]);

        });

    }

    tuggleMute = () => {
        this.props.updateMuteState(!this.props.muted);
        this.props.loadMuteState(!this.props.muted);
    }

    render() {

        let cnTabGeneral = "nav-link ";
        let cnTabDetail = "nav-link ";
        let cnTabMembers = "nav-link ";

        let cnTabContentGeneral = "tab-pane fade show ";
        let cnTabContentDetail = "tab-pane fade show bg-white";
        let cnTabContentMembers = "tab-pane fade show bg-white";

        if(this.props.tabState == 'options'){
            cnTabGeneral += " active";
            cnTabContentGeneral += " active";
        }

        if(this.props.tabState == 'detail'){
            cnTabDetail += " active";
            cnTabContentDetail += " active";
        }

        if(this.props.tabState == 'members'){
            cnTabMembers += " active";
            cnTabContentMembers += " active";
        }

        const members = this.props.members;
        members.sort( (obj1,obj2) => {
            return -1 * ( obj1.onlineStatus - obj2.onlineStatus );
        });

        return (
            <div> 

                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info">

                    <li className="nav-item" onClick={ () => {this.tabChange("options")}}>
                        <a className={cnTabGeneral}>{strings.InfoViewUserDetailOptions[user.lang]}</a>
                    </li>
                    <li className="nav-item" onClick={ () => {this.tabChange("detail")}}>
                        <a className={cnTabDetail}>{strings.InfoViewUserDetailDetail[user.lang]}</a>
                    </li>
                    <li className="nav-item" onClick={ () => {this.tabChange("members")}}>
                        <a className={cnTabMembers}>{strings.InfoViewUserDetailMembers[user.lang]}</a>
                    </li>

                </ul>
                
                <div className="tab-content">
                    
                    <div className={cnTabContentGeneral}>

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
                                <span className="form-control">{this.props.group.name}</span>
                                <label>{strings.InfoViewUserDetailName[user.lang]}</label>
                            </div>
                
                            <div className="form-group do-float">
                                <span className="form-control">{this.props.group.description}&nbsp;</span>
                                <label>{strings.InfoViewUserDetailDescription[user.lang]}</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">
                                    <DateTime timestamp={this.props.group.created} />
                                </span>
                                <label>{strings.InfoViewCreated[user.lang]}</label>
                            </div>

                        </div>

                    </div>

                    <div className={cnTabContentMembers}>

                        <div className="quickview-block form-type-material">
                            
                            <div className="media-list media-list-hover">

                                {members.map( user => {

                                    let fileId = null;

                                    if (user.avatar && user.avatar.thumbnail)
                                        fileId = user.avatar.thumbnail.nameOnServer;

                                    let classname = " avatar ";
                                    if(user.onlineStatus)
                                        classname += " status-success";

                                    return <div className="media media-single media-action-visible cursor-pointer" key={user._id} onClick={ () => { this.props.openChat(user) }} >
                                        <span className={classname}>
                                            <AvatarImage className="status-success" fileId={fileId} type={constant.AvatarUser} />
                                        </span>
                                        <p className="title">{user.name} {user.onlineStatus}</p>
                                        <a className="media-action" href="#"><i className="fa fa-comment"></i></a>
                                    </div>

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
        tabState: state.chatUI.groupInfoTabState,
        group: state.infoView.group,
        timestampByChat: state.chat.timestampByChat,
        muted: state.infoView.muted,
        members: state.infoView.members
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        tabChange: tabName => dispatch(actions.chatUI.tabChangedGroupInfo(tabName)),
        loadDone: () => dispatch(actions.infoView.loadDone()),
        loadMuteState: (state) => dispatch(actions.infoView.loadMuteState(state)),
        showError: (err) => dispatch(actions.notification.showToast(err)),
        updateMuteState: (state) => dispatch(actions.infoView.updateMuteState(state,constant.ChatTypeGroup)),
        loadMembers: () => dispatch(actions.infoView.loadMembers()),
        openChat: user => dispatch(actions.chat.openChatByUser(user))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupInfo);
