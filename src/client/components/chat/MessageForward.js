import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import * as constant from "../../lib/const";
import * as actions from "../../actions";
import * as util from "../../lib/utils";

import AvatarImage from "../AvatarImage";

class MessageForward extends Component {
    static propTypes = {};

    constructor() {
        super();
        this.lastSearchTimeout;
    }

    onInputChange = e => {
        e.persist();

        clearTimeout(this.lastSearchTimeout);

        this.lastSearchTimeout = setTimeout(() => {
            this.props.searchAll(e.target.value);
        }, constant.SearchInputTimeout);
    };

    render() {

        const mainStyle = {
            display: "none"
        };

        if (this.props.visibility) mainStyle.display = "block";

        return (
            <div className="modal-open">
                <div
                    className="modal modal-center fade show"
                    id="modal-center"
                    tabIndex="-1"
                    style={mainStyle}
                >
                    <div className="modal-dialog messageForward">
                        <div className="modal-content">
                            <div className="modal-header">

                                <h5 className="modal-title">Forward message</h5>

                                <button type="button" className="close msgInfo-dialog-close" onClick={e => this.props.hideMessageForwardView()}>
                                    <span className="msgInfo-dialog-close" aria-hidden="true">×</span>
                                </button>

                            </div>
                            <form className="lookup lookup-lg w-100 bb-1 border-light">
                                <input onChange={this.onInputChange} className="w-100 no-radius no-border input--height60" type="text" placeholder="Search..." />
                            </form>
                            {this.props.isLoading
                                ? <div className="spinner-linear">
                                    <div className="line" />
                                </div>
                                : null}
                            <div className="modal-body">
                                <div className="media-list-body bg-white">

                                    {this.props.searchResults.map(resultItem => {

                                        let fileId = null;

                                        let avatarType;
                                        let chatId;

                                        if (resultItem.type === constant.ChatTypeRoom) {
                                            avatarType = constant.AvatarRoom;
                                            chatId = util.chatIdByRoom(resultItem);
                                        }
                                        if (resultItem.type === constant.ChatTypeGroup) {
                                            avatarType = constant.AvatarGroup;
                                            chatId = util.chatIdByGroup(resultItem);
                                        }
                                        if (resultItem.type === constant.ChatTypePrivate) {
                                            avatarType = constant.AvatarUser;
                                            chatId = util.chatIdByUser(resultItem);
                                        }

                                        if (resultItem.avatar && resultItem.avatar.thumbnail)
                                            fileId = resultItem.avatar.thumbnail.nameOnServer;


                                        return (
                                            <div className="media align-items-center" key={resultItem._id} onClick={() => {
                                                this.props.forwardMessage(chatId);
                                                this.props.hideMessageForwardView()
                                            }}>

                                                <span className="flexbox flex-grow gap-items text-truncate">

                                                    <AvatarImage fileId={fileId} type={avatarType} />

                                                    <div className="media-body text-truncate">
                                                        <h6>{resultItem.name}</h6>
                                                        <small>
                                                            <span>{resultItem.description}</span>
                                                        </small>
                                                    </div>

                                                </span>

                                            </div>
                                        )

                                    })}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {this.props.visibility
                    ? <div className="modal-backdrop fade show" />
                    : null}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoading: state.messageForward.loading,
        visibility: state.chatUI.messageForwardViewState,
        searchResults: state.messageForward.searchResults
    };
};

const mapDispatchToProps = dispatch => {
    return {
        searchAll: value => dispatch(actions.searchAll.searchAll(value)),
        forwardMessage: roomId => dispatch(actions.chat.forwardMessage(roomId)),
        hideMessageForwardView: () =>
            dispatch(actions.chatUI.hideMessageForwardView())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageForward);
