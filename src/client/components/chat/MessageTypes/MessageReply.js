import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as actions from "../../../actions";

import Encryption from "../../../lib/encryption/encryption";
import * as constant from "../../../lib/const";

import MessageReplyText from './MessageReplyTypes/MessageReplyText';
import MessageReplySticker from './MessageReplyTypes/MessageReplySticker';
import MessageReplyFile from './MessageReplyTypes/MessageReplyFile';
import MessageReplyFileImage from './MessageReplyTypes/MessageReplyFileImage';

class MessageReply extends Component {
    static propTypes = {};
    constructor() {
        super();
    }

    componentDidMount() {
    }

    render() {
        let replyMessage = this.props.replyMessage;
        let ReplyMessageType;

        if (replyMessage) {
            switch (replyMessage.type) {
                case constant.MessageTypeText:
                    ReplyMessageType = MessageReplyText;
                    break;
                case constant.MessageTypeSticker:
                    ReplyMessageType = MessageReplySticker;
                    break;
                case constant.MessageTypeFile:
                    if (replyMessage.mimeType && replyMessage.mimeType.includes(constant.imgMimeType)) {
                        ReplyMessageType = MessageReplyFileImage;
                        break;
                    }
                    else {
                        ReplyMessageType = MessageReplyFile;
                        break;
                    }
            }
        }

        return replyMessage ? (<div className="reply-message-wrapper">
            <ReplyMessageType replyMessage={this.props.replyMessage} />
            {React.cloneElement(this.props.children, { key: this.props.key })}
        </div>)
            : React.cloneElement(this.props.children, { key: this.props.key });

    }

}

const mapStateToProps = state => {
    return {
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageReply);
