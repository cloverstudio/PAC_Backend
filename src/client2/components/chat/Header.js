import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';

import spikaLogoPic from '../../assets/img/logoLight.png';

class Header extends Component {

    static propTypes = {
    }

    toggleNotification = (e) => {
        if(!this.props.notificationState)
            this.props.showNotifications();
        else
            this.props.hideNotifications();
    }


    toggleUsersView = (e) => {
        if(!this.props.usersViewState)
            this.props.showUsersView();
        else
            this.props.hideUsersView();
    }

    toggleGroupsView = (e) => {
        if(!this.props.groupsViewState)
            this.props.showGroupsView();
        else
            this.props.hideGroupsView();
    }

    render() {

        let notificationsMenuClass = "dropdown-menu dropdown-menu-right";
        if(this.props.notificationState)
            notificationsMenuClass += " show";

        let usersViewClass = "quickview usersview";
        if(this.props.usersViewState)
            usersViewClass += " reveal";


        let groupsViewClass = "quickview groupsview";
        if(this.props.groupsViewState)
            groupsViewClass += " reveal";

        return (
            
            <header className="topbar">

                <div className="topbar-left">
                    <span className="topbar-btn sidebar-toggler"><i>&#9776;</i></span>
                </div>

                <div className="topbar-right">
                    <a className="topbar-btn" onClick={this.toggleUsersView}><i className="fa fa-user"></i></a>
                    <div className={usersViewClass}>
                        <div className="spinner-linear">
                            <div className="line"></div>
                        </div>
                    </div>

                    <a className="topbar-btn" onClick={this.toggleGroupsView}><i className="fa fa-users"></i></a>
                    <div className={groupsViewClass}>
                        <div className="spinner-linear">
                            <div className="line"></div>
                        </div>
                    </div>


                    <div className="topbar-divider"></div>

                    <ul className="topbar-btns">

                        <li className="dropdown d-none d-md-block">
                            
                            <span className="topbar-btn has-new" onClick={this.toggleNotification}>
                                <i className="fa fa-bell-o"></i>
                            </span>

                            <div className={notificationsMenuClass}>

                                <div className="media-list media-list-hover media-list-divided media-list-xs">

                                <a className="media media-new" href="#">
                                    <span className="avatar bg-success"><i className="ti-user"></i></span>
                                    <div className="media-body">
                                    <p>New user registered</p>
                                    <time dateTime="2017-07-14 20:00">Just now</time>
                                    </div>
                                </a>

                                <a className="media" href="#">
                                    <span className="avatar bg-info"><i className="ti-shopping-cart"></i></span>
                                    <div className="media-body">
                                    <p>New order received</p>
                                    <time dateTime="2017-07-14 20:00">2 min ago</time>
                                    </div>
                                </a>

                                <a className="media" href="#">
                                    <span className="avatar bg-warning"><i className="ti-face-sad"></i></span>
                                    <div className="media-body">
                                    <p>Refund request from <b>Ashlyn Culotta</b></p>
                                    <time dateTime="2017-07-14 20:00">24 min ago</time>
                                    </div>
                                </a>

                                <a className="media" href="#">
                                    <span className="avatar bg-primary"><i className="ti-money"></i></span>
                                    <div className="media-body">
                                    <p>New payment has made through PayPal</p>
                                    <time dateTime="2017-07-14 20:00">53 min ago</time>
                                    </div>
                                </a>
                                </div>

                                <div className="dropdown-footer">
                                <div className="left">
                                    <a href="#">Read all notifications</a>
                                </div>

                                <div className="right">
                                    <a href="#" data-provide="tooltip" title="Mark all as read"><i className="fa fa-circle-o"></i></a>
                                    <a href="#" data-provide="tooltip" title="Update"><i className="fa fa-repeat"></i></a>
                                    <a href="#" data-provide="tooltip" title="Settings"><i className="fa fa-gear"></i></a>
                                </div>
                                </div>

                            </div>
                        </li>
                    </ul>
                </div>
            </header>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        notificationState:state.chatUI.notificationState,
        usersViewState:state.chatUI.usersViewState,
        groupsViewState:state.chatUI.groupsViewState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showNotifications: () => dispatch(actions.chatUI.showNotification()),
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        showUsersView: () => dispatch(actions.chatUI.showUsersView()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        showGroupsView: () => dispatch(actions.chatUI.showGroupsView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
