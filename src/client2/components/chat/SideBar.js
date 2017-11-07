import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';

import spikaLogoPic from '../../assets/img/logoLight.png';

class SideBar extends Component {

    static propTypes = {
    }

    render() {
        
        return (
            <aside className="sidebar sidebar-icons-right sidebar-icons-boxed sidebar-expand-lg">
                <header className="sidebar-header">
                    <span className="logo">
                        <Link to={'/chat'}>
                            <img src={spikaLogoPic} alt="logo" />
                        </Link>
                    </span>
                </header>

                <nav className="sidebar-navigation">

                    <ul className="menu">

                        <li className="menu-category">Chat</li>

                        <li className="menu-item">
                            <a className="menu-link" href="../dashboard/general.html">
                            <span className="icon fa fa-search"></span>
                            <span className="title">Search Message</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa fa-plus"></span>
                            <span className="title">New Room</span>
                            </a>
                        </li>


                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-heart-o"></span>
                            <span className="title">Favorite</span>
                            </a>
                        </li>


                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-check"></span>
                            <span className="title">Mark All As Read</span>
                            </a>
                        </li>

                        <li className="menu-category">User Settings</li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-edit"></span>
                            <span className="title">Edit Profile</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-key"></span>
                            <span className="title">Change Password</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-gear"></span>
                            <span className="title">Admin Console</span>
                            </a>
                        </li>
                
                        <li className="menu-item">
                            <Link to={'/logout'} className="menu-link">
                                <span className="icon ion-log-out"></span>
                                <span className="title">Logout</span>
                            </Link>
                        </li>

                        <li className="menu-category">Links</li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-question"></span>
                            <span className="title">Help</span>
                            </a>
                        </li>
                    </ul>
                </nav>

            </aside>
        );
    }

}

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SideBar);
