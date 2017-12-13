import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as config from '../../../lib/config';

class MessageFile extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {
        const message = this.props.message;
        let messageContent;
        const messageClass = 'file-message';
        
        return(
            <p className={messageClass}> 
                <span className="media flex-column align-items-center text-center">
                    <i className="ti-zip text-secondary fs-45 mb-3"></i>
                    <span className="fw-600">{message.file.file.name}</span>
                    <em className="text-fader mb-3">{message.file.file.size / 1000 + 'kB'}</em>
                    <a className="btn btn-bold btn-block btn-cyan" href={config.APIEndpoint + constant.ApiUrlFile + message.file.file.id}>Download</a>
                </span>
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
)(MessageFile);
