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

class Todos extends Base {

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

        return (

            <div className={sideBarClass} onClick={this.globalClick}>

                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>

                    {this.props.saving ?
                        <div className="spinner-linear todo">
                            <div className="line"></div>
                        </div> : null
                    }

                    <History />

                    <header className="header bg-ui-general">
                        <div className="header-info form-type-line">
                            <h1 className="header-title">
                                <strong>Todos</strong>
                            </h1>
                        </div>
                    </header>

                    <div className="main-content todo">

                        <div className="row">

                            <div className="col-12">

                                <div className="card">

                                    <div className="card-body p-20">

                                        <ul className="tasks-container">

                                            <li className="task-row">

                                                <label className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" />
                                                    <span className="custom-control-indicator"></span>
                                                </label>

                                                Task 1<br />

                                                <div className="text-right">
                                                    <small>
                                                        Due Date : 12.05.2018
                                                        Asigned : Ken
                                                    </small>
                                                </div>

                                            </li>


                                            <li className="task-row">

                                                <label className="custom-control custom-checkbox">
                                                    <input type="checkbox" className="custom-control-input" />
                                                    <span className="custom-control-indicator"></span>
                                                </label>

                                                Task 2<br />

                                                <div className="text-right">
                                                    <small>
                                                        Due Date : 12.05.2018
                                                        Asigned : Ken
                                                    </small>
                                                </div>

                                            </li>

                                            <li className="task-row input">

                                                <input className="empty-text-input" type="text" placeholder="Add New Task" />
                                                <div className="text-right"><small></small></div>

                                            </li>

                                        </ul>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </main>

                <Modals />

            </div >
        );
    }

}

const mapStateToProps = (state) => {
    return {
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
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Todos);
