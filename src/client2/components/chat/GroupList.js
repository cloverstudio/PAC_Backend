import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';
import * as utils from '../../lib/utils';

import AvatarImage from '../AvatarImage';

class GroupList extends Component {

    static propTypes = {
    }

    constructor() {
        super();
        this.currentPage = 1;
        this.lastSearchTimeout;
    }

    onScroll = (e) => {

        const scrollPos = e.target.scrollTop + 0;
        const realScrollPos = scrollPos + e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;

        // if scroll position is between 2px from bottom
        if (Math.abs(realScrollPos - scrollHeight) < 1) {

            if (!this.props.isLoading) {
                this.currentPage++;
                this.props.loadGroupList(this.currentPage);
            }
        }
    }

    onInputChange = (e) => {
        e.persist();

        clearTimeout(this.lastSearchTimeout);

        this.lastSearchTimeout = setTimeout(() => {
            this.props.searchGroupList(e.target.value)

        }, constant.SearchInputTimeout);
    }

    searchOnSubmit = e => {
        e.preventDefault();

        const inputElement = e.target.firstElementChild;

        this.props.searchGroupList(inputElement.value);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.groupsViewState && nextProps.groupsViewState) {
            this.inputField.select();
        }
    }

    render() {

        return (
            <div>
                {this.props.groupsLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div> : null
                }

                <div onScroll={this.onScroll} className="groupsview">

                    <header className="media-list-header b-0">
                        <form className="lookup lookup-lg w-100 bb-1 border-light" onSubmit={this.searchOnSubmit}>
                            <input
                                ref={inputField => this.inputField = inputField}
                                onChange={this.onInputChange}
                                className="w-100 no-radius no-border input--height60"
                                type="text"
                                placeholder="Search..." />
                        </form>
                    </header>

                    <div className="media-list-body bg-white">

                        {this.props.groups.map(group => {

                            let fileId = null;

                            if (group.avatar && group.avatar.thumbnail)
                                fileId = group.avatar.thumbnail.nameOnServer;
                            else
                                fileId = group._id;

                            return (
                                <div className="media align-items-center" key={group._id}
                                    onClick={() => {
                                        let chatId = utils.chatIdByGroup(group);
                                        this.props.openChat(group);
                                        this.props.loadChatMessages(chatId);
                                        this.props.changeCurrentChat(chatId)
                                    }} >
                                    <span className="flexbox flex-grow gap-items text-truncate">

                                        <AvatarImage fileId={fileId} type={constant.AvatarGroup} />

                                        <div className="media-body text-truncate">
                                            <h6>{group.name}</h6>
                                            <small>
                                                <span>{group.description}</span>
                                            </small>
                                        </div>

                                    </span>
                                </div>
                            )

                        })}

                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        groupsLoading: state.grouplist.loading,
        groups: state.grouplist.groups,
        groupsViewState: state.chatUI.groupsViewState,

    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadGroupList: (page) => dispatch(actions.grouplist.loadGroupList(page)),
        searchGroupList: (value) => dispatch(actions.grouplist.searchGroupList(value)),
        openChat: group => dispatch(actions.chat.openChatByGroup(group)),
        loadChatMessages: (chatId) => dispatch(actions.chat.loadChatMessages(chatId)),
        changeCurrentChat: chatId => dispatch(actions.chat.changeCurrentChat(chatId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupList);
