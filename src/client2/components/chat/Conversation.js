import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as strings from '../../lib/strings';
import * as config from '../../lib/config';
import * as util from '../../lib/utils';

import user from '../../lib/user';

import SocketManager from '../../lib/SocketManager';
import Encryption from '../../lib/encryption/encryption';
import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';

class Conversation extends Component {
    constructor(){
        super()
        
        this.savedTextInputValues = {}
    }

    static propTypes = {
    }

    sendStartTyping(roomID = this.props.currentChatId, userID= this.props.user._id, userName= this.props.user.name){
        SocketManager.emit('sendtyping', {
            roomID, 
            type:1, 
            userID, 
            userName
        })
    }

    sendStopTyping(roomID = this.props.currentChatId, userID= this.props.user._id){
         SocketManager.emit('sendtyping', {
             roomID, 
             type:0, 
             userID
         })       
    }

    onScroll = (e) => {  
        if (e.target.scrollTop === 0 && !this.props.isLoading){
            this.props.loadOldMessages(this.props.currentChatId, this.props.messageList[0]._id)
        }
    }

    componentWillUpdate(nextProps){
        this.lastConversationHeight = this.scrollableConversation.scrollHeight
    }
    
    componentWillReceiveProps(nextProps){
        if (this.props.currentChatId && this.props.currentChatId !== nextProps.currentChatId){
            const newInputValues = {...this.savedTextInputValues}
            newInputValues[this.props.currentChatId] = this.chatInputElement.value
            this.savedTextInputValues = newInputValues
            
            this.sendStopTyping()
        }
    }

    componentDidUpdate(prevProps){
            if (this.props.currentChatId !== prevProps.currentChatId){
                if(this.savedTextInputValues[this.props.currentChatId]){
                    this.chatInputElement.value = this.savedTextInputValues[this.props.currentChatId]
                    
                    this.sendStartTyping()
                }
                else {
                    this.chatInputElement.value = ''
                }
            }

            if (this.props.messageList.length !== prevProps.messageList.length){
                if (this.props.messageList.length - prevProps.messageList.length === 1){
                    util.scrollElemBottom(this.scrollableConversation); 
                }
                else{
                    this.scrollableConversation.scrollTop = this.scrollableConversation.scrollHeight - this.lastConversationHeight                                
                }
        }
    }
    
    render() {
        
        // combine messages from same user
        const combinedMessages = [];
        let currentUserMessages = [];
        let lastUser = "";
        
        for(let i = 0 ; i < this.props.messageList.length ; i++){

            const message = this.props.messageList[i];
            const currentUser = message.user._id;

            if(lastUser != "" && currentUser != lastUser){
                combinedMessages.push(currentUserMessages);
                currentUserMessages = [];
            }

            currentUserMessages.push(message);
            lastUser = currentUser;

        }

        if(currentUserMessages.length > 0)
            combinedMessages.push(currentUserMessages);

        return (
            
            <div className="chat-container card card-bordered flex-column">

                {this.props.isLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div> : null
                }

                <header className="flexbox align-items-center p-12 pr-20 bg-lighter bb-1 border-light">
                    <div className="media align-items-center p-0">

                        <AvatarImage 
                            fileId={this.props.chatAvatar.fileId} 
                            type={this.props.chatAvatar.type} />

                        <div className="media-body">
                            <h6>{this.props.chatAvatar.name}</h6>
                            <small>{this.props.isTyping ? 'Typing...' : null}</small>
                        </div>
                        
                    </div>
                </header>

                <div ref={ (scrollableConversation) => { 
                        this.scrollableConversation = scrollableConversation}
                    }
                    onScroll={ this.onScroll }
                    className="scrollable flex-grow chat-content">

                    {combinedMessages.map( (messagesFromSameUser) => {

                        const firstMessage = messagesFromSameUser[0];
                        const lastMessage = messagesFromSameUser[messagesFromSameUser.length - 1];
                        const user = firstMessage.user;
                        
                        if(user._id == this.props.user._id){
        
                            return <div className="media media-chat mymessage" key={firstMessage._id || firstMessage.localID}>
                                <div className="media-body">

                                    {messagesFromSameUser.map( (message) => {
                                        
                                        let messageContent;

                                        switch(message.type){
                                            case constant.MessageTypeText:
                                                messageContent = Encryption.decryptText(message.message);
                                                break;
                                            case constant.MessageTypeSticker:
                                                messageContent = <img src={'https://spika.chat'+message.message}/>;
                                                break;
                                            default:
                                                messageContent = null;
                                        }

                                        return <p className={typeof message._id === 'undefined' ? 'unsent' : null} key={message._id || message.localID}>{messageContent}</p>

                                    })}

                                    <p className="meta">
                                        <DateTime timestamp={lastMessage.created} />
                                    </p>

                                </div>
                            </div>
                        }else
                            return <div className="media media-chat" key={firstMessage._id}>
                                <AvatarImage type={constant.AvatarUser} user={user} />
                                <div className="media-body">
    
                                        {messagesFromSameUser.map( (message) => {

                                            let messageContent;

                                            switch(message.type){
                                                case constant.MessageTypeText:
                                                    messageContent = Encryption.decryptText(message.message);
                                                    break;
                                                case constant.MessageTypeSticker:
                                                    messageContent = <img src={'https://spika.chat'+message.message}/>;
                                                    break;
                                                default:
                                                    messageContent = null;
                                            }

                                            return <p key={message._id}>{messageContent}</p>
                                        })}
    
                                        <p className="meta">
                                            <DateTime timestamp={lastMessage.created} />
                                        </p>
    
                                    </div>
                                </div> 

                    })}

                    {/*<div className="media media-chat">
                    <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                    <div className="media-body">
                        <p>Hi</p>
                        <p>How are you ...???</p>
                        <p>What are you doing tomorrow?<br />Would you like to get out of the town for a while?</p>
                        <p className="meta"><time dateTime="2017">23:58</time></p>
                    </div>
                    </div>

                    <div className="media media-meta-day">Today</div>

                    <div className="media media-chat mymessage">
                    <div className="media-body">
                        <p>Hiii, I'm good.</p>
                        <p>How are you doing?</p>
                        <p>Long time no see!</p>
                        <p className="meta"><time dateTime="2017">00:06</time></p>
                    </div>
                    </div>

                    <div className="media media-chat">
                    <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                    <div className="media-body">
                        <p>Yeah</p>
                        <p>We were out of country for a vacation. We visited several beautiful countries and made a lot of memmories. :stuck_out_tongue_winking_eye: :stuck_out_tongue_winking_eye:</p>
                        <p className="meta"><time dateTime="2017">00:07</time></p>
                    </div>
                    </div>

                    <div className="media media-chat mymessage">
                    <div className="media-body">
                        <p>That's awesome!</p>
                        <p>You should tell me everything with all small details. I'm so curious to hear your stories.</p>
                        <p>Did you take pictures?</p>
                        <p className="meta"><time dateTime="2017">00:09</time></p>
                    </div>
                    </div>

                    <div className="media media-chat">
                    <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                    <div className="media-body">
                        <p>We took a loooot. Here is some of them, I'll show you the rest once we meet.</p>
                        <p className="row gap-1" data-provide="photoswipe">
                        <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/8.jpg" alt="..." /></a>
                        <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/11.jpg" alt="..." /></a>
                        <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/7.jpg" alt="..." /></a>
                        </p>
                        <p className="meta"><time dateTime="2017">00:10</time></p>
                    </div>
                    </div>

                    <div className="media media-chat mymessage">
                    <div className="media-body">
                        <p>These places are fantastic. Wish I could join you guys :disappointed: :disappointed:</p>
                        <p className="meta"><time dateTime="2017">00:10</time></p>
                    </div>
                    </div>

                    <div className="media media-chat">
                    <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                    <div className="media-body">
                        <p>You can actually. We are planning our next vacation for new year holidays :wink:</p>
                        <p className="meta"><time dateTime="2017">00:12</time></p>
                    </div>
                    </div>

                    <div className="media media-chat mymessage">
                    <div className="media-body">
                        <p>Are you serious?!! :heart_eyes:</p>
                        <p className="meta"><time dateTime="2017">00:12</time></p>
                    </div>
                </div> */}

                </div>

                <footer className="publisher">
                    <img className="avatar align-self-start" src="../assets/img/avatar/2.jpg" alt="..." />
                    <input 
                        className="publisher-input" 
                        rows="1" 
                        placeholder="Write something" 
                        ref={input => this.chatInputElement = input}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && e.target.value){
                                this.props.sendMessage(constant.MessageTypeText, e.target.value);
                                this.savedTextInputValues[this.props.currentChatId] = '';
                                this.chatInputElement.value = '';

                                this.sendStopTyping();
                            }
                        }}
                        onChange={e=> {
                            if(e.target.value.length === 1) this.sendStartTyping()
                            if(e.target.value.length === 0) this.sendStopTyping()
                            }}
                        />
                    <div className="align-self-end gap-items">
                        <span className="publisher-btn file-group">
                            <i className="fa fa-paperclip file-browser"></i>
                            <input type="file" />
                        </span>
                        <a className="publisher-btn" href="#"><i className="fa fa-smile-o"></i></a>
                        <span 
                            className="publisher-btn" 
                            onClick={e=> {
                                this.props.sendMessage(constant.MessageTypeText, this.chatInputElement.value);
                                this.savedTextInputValues[this.props.currentChatId] = '';
                                this.chatInputElement.value = '';

                                this.sendStopTyping();

                            }}>
                            <i className="fa fa-paper-plane"></i>
                        </span>
                    </div>
                </footer>

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        currentChatId:state.chat.chatId,
        chatAvatar:state.chat.chatAvatar,
        isLoading:state.chat.isLoading,
        messageList: state.chat.messageList,
        user:user.userData,
        isTyping: state.chat.isTyping
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadOldMessages: (chatID, lastMessage) => dispatch(actions.chat.loadOldMessages(chatID, lastMessage)), 
        sendMessage : (messageType, content) => dispatch(actions.chat.sendMessage(messageType, content))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Conversation);
