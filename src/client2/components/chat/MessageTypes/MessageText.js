import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

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
        let messageContent;
        const messageClass = typeof message._id === 'undefined' ? ' unsent' : '';
        
        messageContent = Encryption.decryptText(message.message);
        
        let urls = messageContent.match(constant.urlRegularExpression);
 
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
        
        return(
            <p className={messageClass}>{messageContent}</p>
        );
    }

}

const mapStateToProps = (state) => {
    return {       
    };
};

const mapDispatchToProps = (dispatch) => {
    return {  
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageText);
