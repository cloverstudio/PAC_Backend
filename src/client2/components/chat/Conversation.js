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
import Stickers from './Stickers';

class Conversation extends Component {
    constructor(){
        super()
        
        this.savedTextInputValues = {};
        this.todayDate = new Date().getDate();
        this.stickersLoaded = false;
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

    toggleStickersView = () => {
        if(!this.props.stickersViewState){
            this.props.showStickersView();

            if(!this.stickersLoaded){
                this.props.loadStickers();
                this.stickersLoaded = true;
            }

        }
        else
            this.props.hideStickersView();
    }
    
    render() {
        
        // combine messages from same user
        const combinedMessages = [];
        let currentUserMessages = [];
        let lastUser = "";
        let todayLimitSet = false;
        
        for(let i = 0 ; i < this.props.messageList.length ; i++){

            const message = this.props.messageList[i];
            const currentUser = message.user._id;
            const messageDate = new Date(message.created).getDate();

            if(!todayLimitSet && this.todayDate === messageDate){
                combinedMessages.push(currentUserMessages);                
                combinedMessages.push('Today')
                todayLimitSet = true;
                currentUserMessages = [];
            }

            if(lastUser != "" && currentUser != lastUser && currentUserMessages.length > 0){
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

                        if(messagesFromSameUser === 'Today'){
                            return <div key='todayLimit' className='media media-meta-day'>Today</div>
                        }

                        const firstMessage = messagesFromSameUser[0];

                        if(!firstMessage)
                            return null;
                            
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
                                                if (constant.urlRegularExpression.test(messageContent))
                                                    messageContent = <a href={messageContent} target="_blank"><u>{messageContent}</u></a>
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
                                                    if (constant.urlRegularExpression.test(messageContent))
                                                        messageContent = <a href={messageContent} target="_blank"><u>{messageContent}</u></a>
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
                        <span 
                            className="publisher-btn"
                            onClick={this.toggleStickersView}>
                            <i className="fa fa-smile-o"></i>
                        </span>
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
        isTyping: state.chat.isTyping,
        stickersViewState: state.chatUI.stickersViewState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadOldMessages: (chatID, lastMessage) => dispatch(actions.chat.loadOldMessages(chatID, lastMessage)), 
        sendMessage : (messageType, content) => dispatch(actions.chat.sendMessage(messageType, content)),
        showStickersView : () => dispatch(actions.chatUI.showStickersView()),
        hideStickersView : () => dispatch(actions.chatUI.hideStickersView()),
        loadStickers : () => dispatch(actions.stickers.loadStickers())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Conversation);
