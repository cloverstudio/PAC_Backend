import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';
import Encryption from '../../lib/encryption/encryption';

import MessageText from './MessageTypes/MessageText';
import MessageSticker from './MessageTypes/MessageSticker';
import MessageFile from './MessageTypes/MessageFile';
import MessageFileUploading from './MessageTypes/MessageFileUploading';
import MessageFileImage from './MessageTypes/MessageFileImage';

class Message extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {

        switch(this.props.messageData.type){
            case constant.MessageTypeText:
                return <MessageText message={this.props.messageData}/>

            case constant.MessageTypeSticker:
                return <MessageSticker message={this.props.messageData} scrollChat={this.props.scrollChat}/>

            case constant.MessageTypeFile:
                if (typeof this.props.messageData._id !== 'undefined'){

                    if(typeof this.props.messageData.file !== 'undefined' && this.props.messageData.file !== null){

                        const [fileMimeType, fileMimeSubtype] = this.props.messageData.file.file.mimeType.split('/')

                        if (fileMimeType === constant.imgMimeType){
                            return <MessageFileImage message={this.props.messageData} scrollChat={this.props.scrollChat}/>
                        }
                        else{
                            return <MessageFile message={this.props.messageData}/>
                        }
                    }

                }
                else{
                    return <MessageFileUploading message={this.props.messageData}/>
                }

            default:
                return null
        }
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
        showImageView: imgId => dispatch(actions.chatUI.showImageView(imgId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Message);
