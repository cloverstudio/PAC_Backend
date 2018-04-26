import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../../actions';

class MessageText extends Component {

    static propTypes = {
    }
    constructor() {
        super();
    }

    render() {
        const message = this.props.message;
        let messageContent;
        const messageClass = 'upload-progress';

        let fileProgress;

        if (typeof this.props.fileProgress[this.props.currentChatId][message.localID] !== 'undefined') {
            fileProgress = this.props.fileProgress[this.props.currentChatId][message.localID].progress;
        }
        else {
            fileProgress = 100;
        }

        let progressBarStyle = {
            width: fileProgress + '%',
            height: '16px'
        };

        return (
            <div className={messageClass}>
                <div className="upload-abort" onClick={() => this.props.abortFileUpload(message.localID)}>
                    <i className="fa fa-ban"></i>
                </div>
                <div className="progress">
                    {typeof fileProgress != 'undefined' ?
                        <div className="progress-bar" role="progressbar" style={progressBarStyle}>
                            <strong>{fileProgress}%</strong>
                        </div> : null}
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        currentChatId: state.chat.chatId,
        fileProgress: state.files
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        abortFileUpload: localID => dispatch(actions.chat.abortFileUpload(localID))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageText);
