import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Remarkable from 'remarkable';
import hljs from 'highlight.js';
import twemoji from 'twemoji';

import * as actions from '../actions';

import * as config from '../lib/config';
import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

import user from '../lib/user';
import { store } from '../index';

import Base from './Base';

import Modals from '../components/Modals';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import AvatarImage from '../components/AvatarImage';
import DateTime from '../components/DateTime';

class Note extends Base {

    constructor() {
        super();
        this.chatId = null;
        this.md = new Remarkable('full', {
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value.replace("\n", "<br />");
                    } catch (err) { }
                }

                try {
                    return hljs.highlightAuto(str).value;
                } catch (err) { }

                return ''; // use external default escaping
            }
        });
    }

    static propTypes = {
    }

    save = (e) => {

        if (!this.chatId)
            return;

        this.props.save(this.chatId, this.props.note);

    }

    componentDidMount() {

        const url = this.props.location;
        const chatId = url.replace(config.BasePath + "/note", "").replace("/", "");

        if (chatId.length > 1)
            this.chatId = chatId;
        else
            return;

        this.props.load(this.chatId);

    }

    componentWillUnmount() {
    }

    render() {

        let sideBarClass = "pace-done sidebar-folded";
        if (this.props.sidebarState)
            sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if (this.props.historyBarState)
            asideBarHolderClass += " aside-open";


        const rowHTML = this.md.render(this.props.note)
            .replace(/<blockquote>/g, '<blockquote class="blockquote">')
            .replace(/<table>/g, '<table class="table">')
            .replace(/<img>/g, '<img class="rounded">');

        const html = { __html: rowHTML };

        return (

            <div className={sideBarClass} onClick={this.globalClick}>

                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>

                    {this.props.loading ?
                        <div className="spinner-linear profile">
                            <div className="line"></div>
                        </div> : null
                    }

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>{strings.NoteTitle[user.lang]}</strong>
                                <small>{strings.FavoriteTitleFrom[user.lang]}{this.props.chatName}</small>
                            </h1>
                        </div>
                    </header>

                    <div className="main-content note">

                        <div className="col-12">

                            <div className="card">

                                <div className="card-body p-20">

                                    {this.props.state == constant.NotesStateEdit ?
                                        <div className="input-group">
                                            <textarea type="text" value={this.props.note} className="form-control" onChange={e => { this.props.typeNote(e.target.value) }} />
                                        </div> : null
                                    }

                                    {this.props.state == constant.NotesStatePreview ?
                                        <div dangerouslySetInnerHTML={html} /> : null}

                                    {this.props.state == constant.NotesStatePreview &&
                                        this.props.note.length == 0 ?
                                        <div className="callout callout-info" >
                                            <h5>{strings.EmptyMessageTitle[user.lang]}</h5>
                                            <p>{strings.EmptyMessageText[user.lang]}</p>
                                        </div> : null}

                                    <div className="text-right button-container mt-15">

                                        {this.props.state == constant.NotesStatePreview ?
                                            <button onClick={this.props.edit} className="btn btn-w-md btn-primary">{strings.Edit[user.lang]}</button> : null}

                                        {this.props.state == constant.NotesStateEdit ?
                                            <button onClick={this.props.preview} className="btn btn-w-md btn-primary">{strings.Preview[user.lang]}</button> : null}

                                        <button onClick={this.save} className="btn btn-w-md btn-info">{strings.Save[user.lang]}</button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </main>

                <Modals />

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        location: state.routing.location.pathname,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        loading: state.note.loading,
        chatName: state.chat.chatName,
        state: state.note.viewState,
        note: state.note.note
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
        hideStickersView: () => dispatch(actions.chatUI.hideStickersView()),
        hideSidebar: () => dispatch(actions.chatUI.hideSidebar()),
        hideHistory: () => dispatch(actions.chatUI.hideHistory()),

        edit: () => dispatch(actions.note.edit()),
        preview: () => dispatch(actions.note.preview()),
        typeNote: (val) => dispatch(actions.note.typeNote(val)),
        save: (chatId, note) => dispatch(actions.note.save(chatId, note)),
        load: (chatId) => dispatch(actions.note.load(chatId)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Note);
