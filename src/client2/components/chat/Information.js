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

    //hidden-xs-down
    render() {

        let infoContainerClass = "info-container bg-lighter border-light ";
        if(this.props.infoViewState)
            infoContainerClass += " show";

        return (
            
            <div className={infoContainerClass}> 


                {this.props.isLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div> : null
                }
                
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

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        chatType: state.chat.chatType,
        chatAvatar: state.chat.chatAvatar,
        isLoading: state.infoView.isLoading,
        infoViewState: state.chatUI.infoViewState
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
