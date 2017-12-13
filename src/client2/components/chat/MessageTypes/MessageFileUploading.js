import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class MessageText extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {
        const message = this.props.message;
        let messageContent;
        const messageClass = 'upload-progress';
        
        let fileProgress;

        if (typeof this.props.fileProgress[this.props.currentChatId][message.localID] !== 'undefined'){
            fileProgress = this.props.fileProgress[this.props.currentChatId][message.localID].progress;
        }
        else{
            fileProgress = 100;
        }

        let progressBarStyle = {
            width: fileProgress+'%',
            height:'16px'
        };

        return(
            <p className={messageClass}>
                <span className="progress">
                    {typeof fileProgress != 'undefined' ? 
                        <span className="progress-bar" role="progressbar" style={progressBarStyle}>
                            <strong>{fileProgress}%</strong>
                        </span> : null}
                </span>
            </p>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        currentChatId:state.chat.chatId,
        fileProgress: state.files       
    };
};

const mapDispatchToProps = (dispatch) => {
    return {  
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageText);
