import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../../../actions';

import Encryption from '../../../lib/encryption/encryption';
import * as constant from '../../../lib/const';

class MessageText extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {
        const message = this.props.message;
        let messageClass = 'text-message'
        messageClass += typeof message._id === 'undefined' ? ' unsent' : '';
        
        const messageContent = Encryption.decryptText(message.message);

        let formattedMessages;
        console.log(messageContent)
        if (messageContent.length === 0){
            
            formattedMessages = 'This message is deleted';
        }
        else{
            //todo: better way to mark links
            formattedMessages = messageContent.split(/( |\n)/)
            .map((word,i) => constant.urlRegularExpression.test(word) ? <a key={i} href={word} target="_blank"><u> {word} </u></a> : word)
        }

        return(
            <p className={messageClass} onClick={e => this.props.getMessageInfo(message)}>{formattedMessages}</p>
        );
    }

}

const mapStateToProps = (state) => {
    return {       
    };
};

const mapDispatchToProps = (dispatch) => {
    return {  
        getMessageInfo : message => dispatch(actions.messageInfo.getMessageInfo(message))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageText);
