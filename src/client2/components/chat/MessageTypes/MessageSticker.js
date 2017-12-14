import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as config from '../../../lib/config';

class MessageSticker extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {
        const message = this.props.message;        
        const messageClass = typeof message._id === 'undefined' ? 'sticker-message unsent' : 'sticker-message';

        return(
            <p className={messageClass}>
                <img onLoad={e => this.props.scrollChat()} src={config.mediaBaseURL + message.message}/>
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageSticker);
