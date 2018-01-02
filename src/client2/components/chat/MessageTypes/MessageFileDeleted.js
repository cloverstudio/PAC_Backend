import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as config from '../../../lib/config';
import * as actions from '../../../actions';

class MessageFileDeleted extends Component {

    static propTypes = {
    }
    constructor(){
        super();   
    }

    render() {
        const message = this.props.message;

        return(
            <p className="text-message" onClick={e => this.props.getMessageInfo(message)}>
                <i>This message is deleted.</i>
            </p>
        );
    }

}

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getMessageInfo: message => dispatch(actions.messageInfo.getMessageInfo(message))  
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageFileDeleted);
