import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as config from '../../../lib/config';
import * as actions from '../../../actions';

class MessageFileImage extends Component {

    static propTypes = {
    }
    constructor(){
        super();
        this.state = {
            isLoading: true,
            initiallyScrolledToSearchTarget: false
        }
    }

    componentDidMount(){
        if (this.targetMessage.classList.contains('search-target')){
            if (!this.state.initiallyScrolledToSearchTarget){
    
                this.props.lockForScroll();
                this.targetMessage.scrollIntoView();
    
                this.setState({
                    ...this.state, 
                    initiallyScrolledToSearchTarget: true
                })
            }
     
        }
      }

    toggleMessageLoading = () => {
        this.setState({
            ...this.state, 
            isLoading : !this.state.isLoading
        })
    }

    render() {
        const message = this.props.message;
        let messageContent;
        let messageClass = 'image-message';

        const [fileMimeType, fileMimeSubtype] = message.file.file.mimeType.split('/')

        const thumbId = fileMimeSubtype === constant.svgXmlMimeSubtype 
        ? message.file.file.id 
        : message.file.thumb.id
        
        if (this.props.searchTarget === message._id) {
            messageClass += ' search-target'
        }
        
        return(
            <p className={messageClass} 
            ref={message => this.targetMessage = message}
            onClick={e => this.props.getMessageInfo(message)}>
                <span>
                    {this.state.isLoading ? 
                        <span className="spinner-linear">
                            <span className="line"></span>
                        </span> : null}

                    <img 
                        className='img-thumbnail'
                        src={config.APIEndpoint + constant.ApiUrlFile + thumbId} 
                        onLoad={e=>{
                            this.toggleMessageLoading();
                            this.props.scrollChat();
                        }}
                        onClick={e=> this.props.showImageView(message.file.file.id)}
                        />
                </span>
            </p>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        searchTarget: state.chat.loadAllToTarget              
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showImageView: imgId => dispatch(actions.chatUI.showImageView(imgId)),
        getMessageInfo: message => dispatch(actions.messageInfo.getMessageInfo(message))        
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageFileImage);
