import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import spikaSignUp from '../assets/img/spikaSignUp.png';
import signupPic from '../assets/img/signupPic.jpg';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';

class Main extends Component {

    static propTypes = {
    }

    render() {
        
        return (
            <div>
                <aside className="sidebar sidebar-icons-right sidebar-icons-boxed sidebar-expand-lg">
                    <header className="sidebar-header">
                        <span className="logo">
                            <a href="../index.html">
                                <img src="../assets/img/logo-light.png" alt="logo" />
                            </a>
                        </span>
                        <span className="sidebar-toggle-fold"></span>
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
                            <a className="menu-link" href="#">
                            <span className="icon ion-log-out"></span>
                            <span className="title">Logout</span>
                            </a>
                        </li>

                        <li className="menu-category">Links</li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-question"></span>
                            <span className="title">Help</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-headphones"></span>
                            <span className="title">Contact Us</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-headphones"></span>
                            <span className="title">Contact Us</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-headphones"></span>
                            <span className="title">Contact Us</span>
                            </a>
                        </li>
                        
                        </ul>
                    </nav>

                </aside>

            </div>
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
)(Main);
