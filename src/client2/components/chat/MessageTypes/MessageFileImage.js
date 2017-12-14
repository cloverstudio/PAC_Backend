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
            isLoading: true
        }
    }

    toggleMessageLoading = () => {
        this.setState({
            isLoading : !this.state.isLoading
        })
    }

    render() {
        const message = this.props.message;
        let messageContent;
        const messageClass = 'image-message';

        const [fileMimeType, fileMimeSubtype] = message.file.file.mimeType.split('/')

        const thumbId = fileMimeSubtype === constant.svgXmlMimeSubtype 
        ? message.file.file.id 
        : message.file.thumb.id 
        
        return(
            <p className={messageClass}>
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showImageView: imgId => dispatch(actions.chatUI.showImageView(imgId))        
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageFileImage);
