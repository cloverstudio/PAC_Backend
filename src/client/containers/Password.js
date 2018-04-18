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

class Password extends Base {

    constructor() {
        super();
    }

    static propTypes = {
    }

    componentDidMount() {
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

        let modalClass = "modal fade";
        if (this.props.success)
            modalClass += " show";

        return (

            <div className={sideBarClass} onClick={this.globalClick}>

                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>

                    {this.props.saving ?
                        <div className="spinner-linear password">
                            <div className="line"></div>
                        </div> : null
                    }

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>{strings.PasswordTitle[user.lang]}</strong>
                            </h1>
                        </div>
                    </header>

                    <div className="main-content password">

                        <div className={modalClass}>
                            <div className="modal-dialog modal-sm">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h4 className="modal-title">{strings.PasswordSucceedDialogTitle[user.lang]}</h4>
                                    </div>
                                    <div className="modal-body">
                                        <p>
                                            {strings.PasswordSucceedDialogMessage[user.lang]}
                                        </p>
                                    </div>
                                    <div className="modal-footer">
                                        <button onClick={this.props.logout} type="button" className="btn btn-bold btn-pure btn-primary">OK</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 pt-15">

                            <div className="card">

                                <div className="card-body p-20">

                                    <div className="form-group">
                                        <label className="require">{strings.PasswordCurrentPassword[user.lang]}</label>
                                        <input type="password" value={this.props.currentPassword} className="form-control" onChange={e => { this.props.typeCurrentPassword(e.target.value) }} />
                                        <div className="invalid-feedback">{this.props.errorMessageCurrentPassword}</div>
                                    </div>

                                    <div className="form-group">
                                        <label className="require">{strings.PasswordNewPassword[user.lang]}</label>
                                        <input type="text" value={this.props.newPassword} className="form-control" onChange={e => { this.props.typeNewPassword(e.target.value) }} />
                                        <div className="invalid-feedback">{this.props.errorMessageNewPassword}</div>
                                    </div>

                                    <div className="form-group">
                                        <label className="require">{strings.PasswordNewPasswordConfirm[user.lang]}</label>
                                        <input type="text" value={this.props.confirmPassword} className="form-control" onChange={e => { this.props.typeConfirmPassword(e.target.value) }} />
                                        <div className="invalid-feedback">{this.props.errorMessageConfirmPassword}</div>
                                    </div>

                                    <div className="text-right button-container">

                                        <button onClick={this.props.cancel} className="btn btn-w-md btn-danger">{strings.Cancel[user.lang]}</button>
                                        <button onClick={this.props.save} className="btn btn-w-md btn-info">{strings.Save[user.lang]}</button>

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

        currentPassword: state.password.currentPassword,
        newPassword: state.password.newPassword,
        confirmPassword: state.password.confirmPassword,

        errorMessageCurrentPassword: state.password.errorMessageCurrentPassword,
        errorMessageNewPassword: state.password.errorMessageNewPassword,
        errorMessageConfirmPassword: state.password.errorMessageConfirmPassword,

        saving: state.password.saving,
        success: state.password.success
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

        typeCurrentPassword: (val) => dispatch(actions.password.typeCurrentPassword(val)),
        typeNewPassword: (val) => dispatch(actions.password.typeNewPassword(val)),
        typeConfirmPassword: (val) => dispatch(actions.password.typeConfirmPassword(val)),
        cancel: () => dispatch(actions.password.cancel()),
        save: () => dispatch(actions.password.save()),
        logout: () => dispatch(actions.password.logout()),

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Password);
