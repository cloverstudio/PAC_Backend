import PropTypes, { string } from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

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
import ReLogin from "../components/ReLogin";

class Profile extends Base {

    constructor() {
        super();
    }

    static propTypes = {
    }

    componentDidMount() {
        console.log('user.userData', user.userData);

        this.props.initProfileView(user.userData);
    }

    componentWillUnmount() {
    }

    render() {

        if (!user.token) return <ReLogin />;

        let sideBarClass = "pace-done sidebar-folded";
        if (this.props.sidebarState)
            sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if (this.props.historyBarState)
            asideBarHolderClass += " aside-open";

        return (

            <div className={sideBarClass} onClick={this.globalClick}>

                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>

                    {this.props.saving ?
                        <div className="spinner-linear profile">
                            <div className="line"></div>
                        </div> : null
                    }

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>{strings.ProfileTitle[user.lang]}</strong>
                            </h1>
                        </div>
                    </header>

                    <div className="main-content profile">

                        <div className="row">

                            <div className="col-12">

                                <div className="card">

                                    <div className="card-body p-20">

                                        <div className="form-group">
                                            <label className="require">{strings.ProfileName[user.lang]}</label>
                                            <input type="text" value={this.props.name} className="form-control" onChange={e => { this.props.typeName(e.target.value) }} />
                                            <div className="invalid-feedback">{this.props.errorMessageName}</div>
                                        </div>

                                        <label>{strings.ProfileDescription[user.lang]}</label>
                                        <div className="input-group">
                                            <textarea type="text" value={this.props.description} className="form-control" onChange={e => { this.props.typeDescription(e.target.value) }} />
                                        </div>

                                        <br />

                                        {this.props.avatarImage ?
                                            <div className="media flex-column b-1 p-0">
                                                <div className="flexbox bg-pale-secondary bt-1 border-light px-12 py-10">
                                                    <span className="flex-grow">{this.props.avatarImage.name}</span>
                                                    <a className="media-action" href="javascript:void(0)" title="Delete" onClick={this.props.deleteFile}><i className="ti-close"></i></a>
                                                </div>
                                                <span className="m-auto">
                                                    <img className="m-1 b-1 img-fluid h-250px " src={this.props.avatarImageUrl} />
                                                </span>
                                            </div> : null
                                        }

                                        <br />

                                        {!this.props.avatarImage ?
                                            <div>
                                                <label>{strings.ProfileAvatar[user.lang]}</label>
                                                <div className="input-group">
                                                    <input type="file" className="form-control" onChange={e => { this.props.selectFile(e.target.files[0]) }} accept="image/*" />
                                                </div>
                                            </div> : null
                                        }

                                        <br />

                                        <div className="text-right button-container">

                                            <button onClick={this.props.cancel} className="btn btn-w-md btn-danger">{strings.Cancel[user.lang]}</button>
                                            <button onClick={this.props.save} className="btn btn-w-md btn-info">{strings.Save[user.lang]}</button>

                                        </div>

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
        isLoading: state.favorites.isLoading,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,

        saving: state.profile.saving,
        name: state.profile.name,
        description: state.profile.description,
        avatarImage: state.profile.avatarImage,
        avatarImageUrl: state.profile.avatarImageUrl,
        errorMessageName: state.profile.errorMessageName
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

        initProfileView: (user) => dispatch(actions.profile.initProfileView(user)),
        typeName: (val) => dispatch(actions.profile.typeName(val)),
        typeDescription: (val) => dispatch(actions.profile.typeDescription(val)),
        selectFile: (val) => dispatch(actions.profile.selectFile(val)),
        deleteFile: (val) => dispatch(actions.profile.deleteFile(val)),
        cancel: () => dispatch(actions.profile.cancel()),
        save: () => dispatch(actions.profile.save()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile);
