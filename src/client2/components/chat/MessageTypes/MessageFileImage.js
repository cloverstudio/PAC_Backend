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
            <div className={messageClass} 
            ref={message => this.targetMessage = message}>

                {this.state.isLoading ? 
                    <span className="spinner-linear">
                        <span className="line"></span>
                    </span> : null}

                <figure className="teaser teaser-simple">
                    <img className='img-thumbnail'
                        src={config.APIEndpoint + constant.ApiUrlFile + thumbId} 
                        onLoad={e=>{
                            this.toggleMessageLoading();
                            this.props.scrollChat();
                        }}
                        alt="image message"
                    />
                    
                    <figcaption>
                        <span className="btn btn-round btn-square btn-info msg-target" 
                        onClick={e => this.props.getMessageInfo(message)}>
                            <i className="fa fa-info msg-target"></i>
                        </span>
                        <span className="btn btn-round btn-square btn-primary" 
                        onClick={e=> this.props.showImageView(message.file.file.id)}>
                            <i className="fa fa-eye"></i>
                        </span>
                    </figcaption>
                </figure>

            </div>
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
