import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';

import * as constant from '../lib/const';
import * as config from '../lib/config';

class AvatarImage extends Component {

    static propTypes = {
    }

    render() {

        if (!this.props.type)
            return null;

        let fileUrl = config.APIEndpoint + constant.ApiUrlGetUserAvatar + this.props.fileId;

        if (this.props.type == constant.AvatarUser) {

            if (!this.props.fileId) {

                const user = this.props.user;
                if (user && user.avatar && user.avatar.thumbnail) {
                    fileUrl = config.APIEndpoint + constant.ApiUrlGetUserAvatar + user.avatar.thumbnail.nameOnServer;
                } else if (user) {
                    fileUrl = config.APIEndpoint + constant.ApiUrlGetUserAvatar + user._id;
                }

            } else {
                fileUrl = config.APIEndpoint + constant.ApiUrlGetUserAvatar + this.props.fileId;
            }

        }

        if (this.props.type == constant.AvatarGroup)
            fileUrl = config.APIEndpoint + constant.ApiUrlGetGroupAvatar + this.props.fileId;

        if (this.props.type == constant.AvatarRoom)
            fileUrl = config.APIEndpoint + constant.ApiUrlGetRoomAvatar + this.props.fileId;

        let classname = "avatar ";
        if (this.props.className)
            classname += this.props.className;

        return (
            <img className={classname} src={fileUrl} alt={this.props.type + ' avatar'} />
        );
    }

}

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AvatarImage);
