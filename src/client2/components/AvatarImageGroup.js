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
        
        const fileUrl = config.APIEndpoint + constant.ApiUrlGetGroupAvatar + this.props.fileId;

        return (
            <img className="avatar" src={fileUrl} alt="..." />
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
