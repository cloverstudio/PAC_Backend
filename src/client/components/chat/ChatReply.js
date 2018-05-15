import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import Encryption from "../../lib/encryption/encryption";
import user from '../../lib/user';

import * as actions from '../../actions';
import * as constant from "../../lib/const";
import * as strings from "../../lib/strings";
import * as config from "../../lib/config";
import * as util from "../../lib/utils";

class ChatReply extends Component {

    constructor() {
        super();
    }

    render() {

        let replyClass = 'reply-wrapper ';
        const replyMessage = this.props.replies[this.props.chatID];
        let replyMessageText;
        let replyImageThumb;

        if (replyMessage) {
            replyClass += 'reply-visible';

            if (replyMessage.type === constant.MessageTypeText) {

                replyMessageText = Encryption.decryptText(replyMessage.message);
                if (replyMessageText.length > 97) {
                    replyMessageText = replyMessageText.slice(0, 96) + '...';
                }
            }

            if (replyMessage.type === constant.MessageTypeSticker) {
                replyImageThumb = <img src={config.mediaBaseURL + replyMessage.message} />
            }

            if (replyMessage.type === constant.MessageTypeFile) {
                if (replyMessage.mimeType && replyMessage.mimeType.includes(constant.imgMimeType)) {
                    const thumbnailImage = typeof replyMessage.thumbId === 'undefined'
                        ? NoThumbnail
                        : config.APIEndpoint + constant.ApiUrlFile + replyMessage.thumbId;

                    replyImageThumb = <img src={thumbnailImage} alt="image" />
                }

                else {
                    replyImageThumb = <div><i className="ti-zip"></i><br />{replyMessage.fileName}</div>
                }
            }
        }
        else {
            replyClass += 'reply-hidden';
        }

        return (

            <div className={replyClass}>
                {
                    replyMessage
                        ? (<div className="reply-container">

                            <div className="reply-message-container">
                                <div className="reply-message-name">
                                    {replyMessage.userId === user.userData._id
                                        ? 'You'
                                        : replyMessage.userName
                                    }
                                </div>
                                <div className={replyMessageText ? "reply-message-text" : "reply-message-image"}>
                                    {replyMessageText || replyImageThumb}
                                </div>
                            </div>

                            <div className="reply-close" onClick={() => this.props.closeReply()}>
                                <i className="ti-close"></i>
                            </div>

                        </div>)
                        : null
                }

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        chatID: state.chat.chatId,
        replies: state.chat.replies
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeReply: () => dispatch(actions.chat.removeReplyMessage())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatReply);
