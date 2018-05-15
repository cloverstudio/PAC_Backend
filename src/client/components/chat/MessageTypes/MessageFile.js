import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as config from '../../../lib/config';
import * as actions from '../../../actions';

class MessageFile extends Component {

    static propTypes = {
    }
    constructor() {
        super();
        this.state = ({
            initiallyScrolledToSearchTarget: false
        })
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

    render() {
        const message = this.props.message;
        let messageContent;
        let messageClass = 'file-message';

        messageClass += message.isFavorite ? " favorite-message" : "";

        if (this.props.searchTarget === message._id) {
            messageClass += ' search-target'
        }

        return (
            <div className={messageClass} ref={message => this.targetMessage = message} onClick={e => { this.props.getMessageInfo(message) }}>
                <span className="media flex-column align-items-center text-center msg-target">
                    <i className="ti-zip fs-45 mb-3"></i>
                    <span className="fw-600">{message.file.file.name}</span>
                    <em className="text-fader mb-3">{message.file.file.size / 1000 + 'kB'}</em>
                    <a className="btn btn-bold btn-block btn-cyan" href={config.APIEndpoint + constant.ApiUrlFile + message.file.file.id}>Download</a>
                </span>
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
        getMessageInfo: message => dispatch(actions.messageInfo.getMessageInfo(message)),
        resetTargetMessage: () => dispatch(actions.chat.resetTargetMessage())

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MessageFile);
