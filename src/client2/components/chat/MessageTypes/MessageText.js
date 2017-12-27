import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as actions from "../../../actions";

import Encryption from "../../../lib/encryption/encryption";
import * as constant from "../../../lib/const";

class MessageText extends Component {
  static propTypes = {};
  constructor() {
    super();
    this.state = ({
        initiallyScrolledToSearchTarget: false
    })
  }

  componentDidMount(){
    if (this.targetMessage.classList.contains('search-target')){
        if (!this.state.initiallyScrolledToSearchTarget){

            this.props.lockForScroll();
            this.targetMessage.scrollIntoView();

            this.setState({
                initiallyScrolledToSearchTarget: true
            })
        }
 
    }
  }

  render() {
    const message = this.props.message;
    let messageClass = "text-message";
    messageClass += typeof message._id === "undefined" ? " unsent" : "";
    
    const messageContent = Encryption.decryptText(message.message);
    
    messageClass += message.isFavorite && messageContent.length > 0 ?  " favorite-message" : "";

    let formattedMessages;

    if (messageContent.length === 0) {
      formattedMessages = <i>This message is deleted.</i>;
    } else {
      //todo: better way to mark links
      formattedMessages = messageContent.split(/( |\n)/).map(
        (word, i) =>
          constant.urlRegularExpression.test(word) 
          ? <a key={i} href={word} target="_blank">
              <u> {word} </u>
            </a>
          : word
      );
    }

    if (this.props.searchTarget === message._id) {
        messageClass += ' search-target'
    }

    return (
      <p className={messageClass} ref={message => this.targetMessage = message} onClick={e => this.props.getMessageInfo(message)}>
        {formattedMessages}
      </p>
    );
  }
}

const mapStateToProps = state => {
  return {
    searchTarget: state.chat.loadAllToTarget
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getMessageInfo: message => dispatch(actions.messageInfo.getMessageInfo(message))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageText);
