import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';
import Encryption from '../../lib/encryption/encryption';

class Message extends Component {

    static propTypes = {
    }
    constructor(){
        super();
        this.state = {
            isLoading: true
        }
    }

    toggleMessageLoading = () => {
        this.setState({
            isLoading : !this.state.isLoading
        })
    }
    render() {

            const message = this.props.messageData;
            let messageContent;
            let messageClass = '';

            switch(message.type){
                case constant.MessageTypeText:
                    messageContent = Encryption.decryptText(message.message);

                    let urls = messageContent.match(/\bhttps?:\/\/\S+/gi);
                    if (urls){    
                        let formatted = [];
                        let lastUrlPos = 0;
                        
                        for (let url of urls){
                            let urlIndex = messageContent.indexOf(url);
                            
                            formatted.push(messageContent.slice(lastUrlPos, urlIndex))
                            formatted.push(<a key={url} href={url}><u>{url}</u></a>)
                            lastUrlPos = urlIndex + url.length;
                        }
                        if (messageContent.length != lastUrlPos){
                            formatted.push(messageContent.slice(lastUrlPos));
                        }
                        messageContent = formatted;
                    }

                    break;
                case constant.MessageTypeSticker:
                    messageClass = 'sticker-message';
                    messageContent = <img 
                    onLoad={e => this.props.scrollChat()} 
                    src={config.mediaBaseURL + message.message}/>;
                    break;
                case constant.MessageTypeFile:
                    //uploaded file (has _id from server)
                    if (typeof message._id !== 'undefined'){
                        if(typeof message.file !== 'undefined' && message.file !== null){
                            //check mimeType
                            const [fileMimeType, fileMimeSubtype] = message.file.file.mimeType.split('/')
                            if (fileMimeType === constant.imgMimeType){
                                const thumbId = fileMimeSubtype === constant.svgXmlMimeSubtype 
                                ? message.file.file.id 
                                : message.file.thumb.id 
                                
                                messageClass = 'image-message';                                                            
                                messageContent = 
                                (<span>
                                    {this.state.isLoading ? 
                                        <span className="spinner-linear">
                                            <span className="line"></span>
                                        </span> : null
                                    }
                                    <img 
                                        className='img-thumbnail'
                                        src={config.APIEndpoint + constant.ApiUrlFile + thumbId} 
                                        onLoad={e=>{
                                            this.toggleMessageLoading();
                                            this.props.scrollChat();
                                        }}
                                        onClick={e=> this.props.showImageView(message.file.file.id)}
                                        />
                                </span>)
                                break;
                            }
                            else {
                                messageClass = 'file-message';
                                messageContent = (
                                    <span className="media flex-column align-items-center text-center">
                                        <i className="ti-zip text-secondary fs-45 mb-3"></i>
                                        <span className="fw-600">{message.file.file.name}</span>
                                        <em className="text-fader mb-3">{message.file.file.size / 1000 + 'kB'}</em>
                                        <a className="btn btn-bold btn-block btn-cyan" href={config.APIEndpoint + constant.ApiUrlFile + message.file.file.id}>Download</a>
                                    </span>)
                                break;
                            }
                        }
                    }
                    else{
                        messageClass='upload-progress';
                        
                        let fileProgress = this.props.fileProgress[this.props.currentChatId][message.localID];
                        

                        let progressBarStyle = {
                            width: fileProgress+'%',
                            height:'16px'
                        };

                        let progressBar = typeof fileProgress != 'undefined' ? 
                        <span className="progress-bar" role="progressbar" style={progressBarStyle}>
                            <strong>{fileProgress}%</strong>
                        </span> :
                        null

                        messageContent=(
                            <span className="progress">
                                {progressBar}
                            </span>)
                        break;
                    }
                default:
                    messageContent = null;
            }
            messageClass += typeof message._id === 'undefined' ? ' unsent' : '';

        return(
             <p className={messageClass}>{messageContent}</p>
        )
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
