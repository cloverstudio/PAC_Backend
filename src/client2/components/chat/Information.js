import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';

import AvatarImage from '../AvatarImage';

import UserInfo from './infoview/UserInfo';
import GroupInfo from './infoview/GroupInfo';
import RoomInfo from './infoview/RoomInfo';

class Information extends Component {

    static propTypes = {
    }

    render() {

        return (
            
            <div className="info-container bg-lighter border-light">

                <div className="spinner-linear">
                    <div className="line"></div>
                </div>
                
                <div className="quickview-body ps-container ps-theme-default">

                    <div className="card card-inverse bg-img" >

                        <div className="card-body text-center pt-50 pb-50">
                            
                            <AvatarImage 
                                className="avatar avatar-xxl avatar-bordered"
                                fileId={this.props.chatAvatar.fileId} 
                                type={this.props.chatAvatar.type} 
                            />

                            <h4 className="mt-2 mb-0">
                                <span className="hover-primary text-white">{this.props.chatAvatar.name}</span>
                            </h4>

                        </div>

                    </div>

                </div>

                {this.props.chatType == constant.ChatTypePrivate ? <UserInfo /> : null }
                {this.props.chatType == constant.ChatTypeGroup ? <GroupInfo /> : null }
                {this.props.chatType == constant.ChatTypeRoom ? <RoomInfo /> : null }

                {/*
                <div className="media">
                    <div className="media-body">
                        <p><strong>Notification</strong></p>
                        <p>This room is muted.</p>
                    </div>
                    <label className="switch switch-lg">
                        <input type="checkbox" />
                        <span className="switch-indicator"></span>
                    </label>
                </div>

                
                <div className="media">
                    <div className="media-body">
                        <p><strong>Block</strong></p>
                        <p>This user is not blocked.</p>
                    </div>
                    <label className="switch switch-lg">
                        <input type="checkbox" />
                        <span className="switch-indicator"></span>
                    </label>
                </div>
                
                <div className="media-list media-list-hover">

                    <div className="media items-center">
                        <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                        <p className="title">Maryam Amiri</p>
                        <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                    </div>
                    
                </div>
                */}

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        chatType: state.chat.chatType,
        chatAvatar:state.chat.chatAvatar,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Information);
