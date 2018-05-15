import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as actions from "../../../../actions";

import Encryption from "../../../../lib/encryption/encryption";
import * as constant from "../../../../lib/const";
import user from "../../../../lib/user";

import * as config from "../../../../lib/config";


class MessageReplySticker extends Component {
    static propTypes = {};
    constructor() {
        super();
    }

    selected = (message) => {
        this.props.loadChatMessages(this.props.currentChatId, message._id);
        this.props.changeCurrentChat(this.props.currentChatId);
    }

    render() {

        const replyMessage = this.props.replyMessage;

        return (
            <div className="reply-message-container">
                <div className="reply-message-name">{
                    replyMessage.userId === user.userData._id
                        ? 'You'
                        : replyMessage.userName
                }</div>
                <div className="reply-message-image" onClick={() => this.selected(replyMessage)}>
                    <img src={config.mediaBaseURL + replyMessage.message} alt="sticker" />
                </div>
            </div>)
    }

}

const mapStateToProps = state => {
    return {
        currentChatId: state.chat.chatId,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changeCurrentChat: chatId => dispatch(actions.chat.changeCurrentChat(chatId)),
        loadChatMessages: (roomId, messageId) => dispatch(actions.chat.loadChatMessages(roomId, messageId, constant.ChatDirectionAllTo))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageReplySticker);
