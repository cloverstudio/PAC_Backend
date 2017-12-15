import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as strings from '../../lib/strings';
import * as utils from '../../lib/utils';
import * as actions from '../../actions';

import user from '../../lib/user';

import spikaLogoPic from '../../assets/img/logoLight.png';

class SideBar extends Component {

    static propTypes = {
    }

    render() {
        
        return (
            <aside className="sidebar sidebar-icons-right sidebar-expand-lg">
                <header className="sidebar-header">
                    <span className="logo">
                        <Link to={`${utils.url('/chat')}`}>
                            <img src={spikaLogoPic} alt="logo" />
                        </Link>
                    </span>
                </header>

                <nav className="sidebar-navigation">

                    <ul className="menu">

                        <li className="menu-category">{strings.SidebarTitle1[user.lang]}</li>

                        <li className="menu-item hidden-lg-up">
                            <Link className="menu-link" to={`${utils.url('/chat')}`}>
                                <span className="icon fa fa-comment"></span>
                                <span className="title">{strings.SidebarChat[user.lang]}</span>
                            </Link>
                        </li>

                        <li className="menu-item hidden-lg-up">
                            <a onClick={this.props.showHistory} className="menu-link" href="javascript:void(0)">
                                <span className="icon fa fa-clock-o"></span>
                                <span className="title history">{strings.SidebarHistory[user.lang]}</span>
                            </a>
                        </li>

                        <li className="menu-item">
                            <Link to={`${utils.url('/search')}`} className="menu-link">
                                <span className="icon fa fa-search"></span>
                                <span className="title">{strings.SidebarSearch[user.lang]}</span>
                            </Link>
                        </li>

                        <li className="menu-item">
                            <Link to={`${utils.url('/newroom')}`} className="menu-link">
                                <span className="icon fa fa fa-plus"></span>
                                <span className="title">{strings.SidebarNewRoom[user.lang]}</span>
                            </Link>
                        </li>


                        <li className="menu-item">
                            <Link to={`${utils.url('/favorites')}`} className="menu-link">
                                <span className="icon fa fa-heart-o"></span>
                                <span className="title">{strings.SidebarFavorite[user.lang]}</span>
                            </Link>
                        </li>


                        <li className="menu-item">
                            <a onClick={this.props.markAll} className="menu-link" href="javascript:void(0)">
                                <span className="icon fa fa-check"></span>
                                <span className="title">{strings.SidebarMarkAll[user.lang]}</span>
                            </a>
                        </li>

                        <li className="menu-category">{strings.SidebarTitle2[user.lang]}</li>

                        <li className="menu-item">
                            <Link to={`${utils.url('/profile')}`} className="menu-link">
                                <span className="icon fa fa-edit"></span>
                                <span className="title">{strings.SidebarProfile[user.lang]}</span>
                            </Link>
                        </li>

                        <li className="menu-item">
                            <Link to={`${utils.url('/password')}`} className="menu-link">
                            <span    className="icon fa fa-key"></span>
                            <   span className="title">{strings.SidebarPassword[user.lang]}</span>
                            </Link>
                        </li>

                        <li className="menu-item">
                            <Link to={`${utils.url('/favorite')}`} className="menu-link">
                                <span className="icon fa fa-gear"></span>
                                <span className="title">{strings.SidebarAdmin[user.lang]}</span>
                            </Link>
                        </li>
                
                        <li className="menu-item">
                            <Link to={`${utils.url('/logout')}`} className="menu-link">
                                <span className="icon ion-log-out"></span>
                                <span className="title">{strings.SidebarLogout[user.lang]}</span>
                            </Link>
                        </li>

                        <li className="menu-category">{strings.SidebarTitle3[user.lang]}</li>

                        <li className="menu-item">
                            <a className="menu-link" href="#">
                            <span className="icon fa fa-question"></span>
                            <span className="title">{strings.SidebarHelp[user.lang]}</span>
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
        showHistory: () => dispatch(actions.chatUI.showHistory()),
        markAll: () => dispatch(actions.history.markAll()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SideBar);
