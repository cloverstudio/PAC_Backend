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

import Ecnryption from '../../lib/encryption/encryption';
import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';

class Conversation extends Component {

    static propTypes = {
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
                            <small>Typing...</small>
                        </div>
                        
                    </div>
                </header>

                <div className="scrollable flex-grow chat-content">

                    {combinedMessages.map( (messagesFromSameUser) => {

                        const firstMessage = messagesFromSameUser[0];
                        const lastMessage = messagesFromSameUser[messagesFromSameUser.length - 1];
                        const user = firstMessage.user;
                        
                        if(user._id == this.props.user._id){

                            return <div className="media media-chat mymessage" key={firstMessage._id}>
                                <div className="media-body">

                                    {messagesFromSameUser.map( (message) => {

                                        if(message.type == constant.MessageTypeText)
                                            message.message = Ecnryption.decryptText(message.message);

                                        return <p key={message._id}>{message.message}</p>
                                    
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
    
                                            if(message.type == constant.MessageTypeText)
                                                message.message = Ecnryption.decryptText(message.message);
    
                                            return <p key={message._id}>{message.message}</p>
                                        
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
                    <input className="publisher-input" rows="1" placeholder="Write something" />
                    <div className="align-self-end gap-items">
                        <span className="publisher-btn file-group">
                            <i className="fa fa-paperclip file-browser"></i>
                            <input type="file" />
                        </span>
                        <a className="publisher-btn" href="#"><i className="fa fa-smile-o"></i></a>
                        <a className="publisher-btn" href="#"><i className="fa fa-paper-plane"></i></a>
                    </div>
                </footer>

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        chatAvatar:state.chat.chatAvatar,
        isLoading:state.chat.isLoading,
        messageList: state.chat.messageList,
        user:user.userData
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Conversation);
