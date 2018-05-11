import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as config from '../../../lib/config';
import * as actions from "../../../actions";


class MessageSticker extends Component {

    static propTypes = {
    }
    constructor() {
        super();
        this.state = ({
            isLoading: true,
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

    toggleMessageLoading = () => {
        this.setState({
            ...this.state,
            isLoading: !this.state.isLoading
        })
    }

    render() {
        const message = this.props.message;
        let messageClass = 'sticker-message';

        if (this.props.searchTarget === message._id) {
            messageClass += ' search-target'
        }

        return (
            <div className={messageClass} ref={message => this.targetMessage = message}>

                {this.state.isLoading
                    ? <div className="spinner-dots">
                        <span className="dot1"></span>
                        <span className="dot2"></span>
                        <span className="dot3"></span>
                    </div>
                    : null}

                <img className='sticker-inner-message'
                    onLoad={e => this.toggleMessageLoading()}
                    src={config.mediaBaseURL + message.message}
                    onClick={e => this.props.getMessageInfo(message)} />
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
)(MessageSticker);
