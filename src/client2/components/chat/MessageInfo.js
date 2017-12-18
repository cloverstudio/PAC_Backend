import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as util from "../../lib/utils";

import * as constant from "../../lib/const";
import * as actions from "../../actions";
import user from "../../lib/user";

import AvatarImage from "../AvatarImage";
import { access } from "fs";
import { messageInfo } from "../../actions";

class MessageInfo extends Component {
    static propTypes = {};

    constructor() {
        super();
    }

    onScroll = e => {};

    componentWillReceiveProps(nextProps) {}

    componentDidMount() {}

    render() {
        let deleteClass = "btn btn-w-sm btn-multiline btn-outline btn-danger";
        const userName =
            typeof this.props.selectedMessage.user === "undefined"
                ? ""
                : this.props.selectedMessage.user.name;
        let messageInfoButtons = [];

        let favoriteClass = "btn btn-w-sm btn-multiline btn-pink ";
        favoriteClass += this.props.selectedMessage.isFavorite
            ? ""
            : "btn-outline";

        if (
            typeof this.props.selectedMessage.deleted === "undefined" ||
            !this.props.selectedMessage.deleted
        ) {
            messageInfoButtons.push(
                <button
                    key="btn-fav"
                    className={favoriteClass}
                    onClick={e =>
                        this.props.toggleFavorite(
                            this.props.selectedMessage._id,
                            this.props.selectedMessage.isFavorite
                        )
                    }
                >
                    <i className="ti-heart fs-20" />
                    <br />Favorite
                </button>
            );
            messageInfoButtons.push(
                <button
                    key="btn-forw"
                    className="btn btn-w-sm btn-multiline btn-outline btn-info"
                    onClick={e => this.props.showMessageForwardView()}
                >
                    <i className="ti-back-right" />
                    <br />Forward
                </button>
            );

            if (this.props.selectedMessage.userID === user.userData._id) {
                messageInfoButtons.push(
                    <button
                        key="btn-upd"
                        className="btn btn-w-sm btn-multiline btn-outline btn-warning"
                    >
                        <i className="ti-pencil" />
                        <br />Update
                    </button>
                );
                messageInfoButtons.push(
                    <button
                        key="btn-del"
                        className="btn btn-w-sm btn-multiline btn-outline btn-danger"
                        onClick={e =>
                            this.props.deleteMessage(
                                this.props.selectedMessage._id
                            )
                        }
                    >
                        <i className="ti-close" />
                        <br />Delete
                    </button>
                );
            }
        }
        return (
            <div
                className={
                    this.props.visible ? "quickview reveal" : "quickview"
                }
            >
                <div className="messageInfoView">
                    <header className="quickview-header">
                        <p className="quickview-title lead"> Message detail </p>
                    </header>

                    <div className="quickview-body ">
                        <div className="quickview-block">
                            <div className="callout callout-success">
                                <h6>sent</h6>
                                <p>
                                    {util.getTimestamp(
                                        new Date(
                                            this.props.selectedMessage.created
                                        )
                                    )}
                                    <br />
                                    {userName}
                                </p>
                            </div>

                            {typeof this.props.selectedMessage.deleted !==
                                "undefined" &&
                            this.props.selectedMessage.deleted !== 0 ? (
                                <div className="callout callout-danger">
                                    <h6>deleted</h6>
                                    <p>
                                        {util.getTimestamp(
                                            new Date(
                                                this.props.selectedMessage.deleted
                                            )
                                        )}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="quickview-block">
                            {messageInfoButtons}
                        </div>
                    </div>

                    <header className="quickview-header">
                        <p className="quickview-title lead"> Seen by </p>
                    </header>

                    {this.props.messageInfoLoading ? (
                        <div className="spinner-linear">
                            <div className="line" />
                        </div>
                    ) : null}

                    <div className="media-list-body bg-white media-list-hover">
                        {this.props.seenBy.map(seenByItem => {
                            const dateObj = new Date(seenByItem.at);
                            const timestamp = util.getTimestamp(dateObj);
                            return (
                                <div
                                    className="media align-items-center"
                                    key={seenByItem.user._id}
                                    onClick={() =>
                                        this.props.openChat(seenByItem.user._id)
                                    }
                                >
                                    <span className="flexbox flex-grow gap-items text-truncate">
                                        <AvatarImage
                                            type={constant.AvatarUser}
                                            user={seenByItem.user}
                                        />

                                        <div className="media-body text-truncate">
                                            <h6>{seenByItem.user.name}</h6>
                                            <small>
                                                <span>at: {timestamp}</span>
                                            </small>
                                        </div>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        visible: state.chatUI.messageInfoViewState,
        messageInfoLoading: state.messageInfo.loading,
        selectedMessage: state.messageInfo.selectedMessage,
        seenBy: state.messageInfo.seenBy
    };
};

const mapDispatchToProps = dispatch => {
    return {
        openChat: userId =>
            dispatch(actions.messageInfo.loadChatByUserSeen(userId)),
        deleteMessage: messageID =>
            dispatch(actions.messageInfo.deleteMessage(messageID)),
        toggleFavorite: (messageId, isFavorite) =>
            dispatch(actions.favorites.toggleFavorite(messageId, isFavorite)),
        showMessageForwardView: () => dispatch(actions.chatUI.showMessageForwardView())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageInfo);
