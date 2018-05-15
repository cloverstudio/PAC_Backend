import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as config from '../../../lib/config';
import * as actions from '../../../actions';

import NoThumbnail from '../../../assets/img/fa-image.png';

class MessageFileImage extends Component {

    static propTypes = {
    }
    constructor() {
        super();
        this.state = {
            isLoading: true,
            initiallyScrolledToSearchTarget: false
        }
    }

    scrollToMessageIfTarget = () => {
        if (this.targetMessage.classList.contains('search-target')) {
            if (!this.state.initiallyScrolledToSearchTarget) {

                this.props.lockForScroll();
                this.targetMessage.scrollIntoView();

                this.setState({
                    initiallyScrolledToSearchTarget: true
                });
                this.targetTimeout = setTimeout(() => {
                    this.props.resetTargetMessage();
                    this.setState({
                        initiallyScrolledToSearchTarget: false
                    })
                }, constant.TargetMessageResetTimeout);
            }

        }
    }

    componentWillUnmount() {
        if (this.targetTimeout) {
            clearTimeout(this.targetTimeout);
            this.props.resetTargetMessage();
        }
    }

    componentDidMount() {
        this.scrollToMessageIfTarget();
    }

    componentDidUpdate() {
        this.scrollToMessageIfTarget();
    }

    toggleMessageLoading = () => {
        this.setState({
            ...this.state,
            isLoading: !this.state.isLoading
        })
    }

    render() {
        const message = this.props.message;
        const thumbnailImage = typeof message.file.thumb === 'undefined'
            ? NoThumbnail
            : config.APIEndpoint + constant.ApiUrlFile + message.file.thumb.id;

        let messageClass = 'image-message';

        if (this.props.searchTarget === message._id) {
            messageClass += ' search-target'
        }

        return (
            <div className={messageClass}
                ref={message => this.targetMessage = message}>

                {this.state.isLoading
                    ? <div className="spinner-dots">
                        <span className="dot1"></span>
                        <span className="dot2"></span>
                        <span className="dot3"></span>
                    </div>
                    : null}

                <figure className="teaser teaser-simple">
                    <img className='img-thumbnail'
                        src={thumbnailImage}
                        onLoad={e => {
                            this.toggleMessageLoading();
                        }}
                        alt="image message"
                    />

                    <figcaption>
                        <span className="btn btn-round btn-square btn-info msg-target"
                            onClick={e => this.props.getMessageInfo(message)}>
                            <i className="fa fa-info msg-target"></i>
                        </span>
                        <span className="btn btn-round btn-square btn-primary"
                            onClick={e => this.props.showImageView(message.file.file.id)}>
                            <i className="fa fa-eye"></i>
                        </span>
                        <a className="btn btn-round btn-square btn-success"
                            href={config.APIEndpoint + constant.ApiUrlFile + message.file.file.id}
                            download>
                            <i className="fa fa-download"></i>
                        </a>
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
        getMessageInfo: message => dispatch(actions.messageInfo.getMessageInfo(message)),
        resetTargetMessage: () => dispatch(actions.chat.resetTargetMessage())

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageFileImage);
