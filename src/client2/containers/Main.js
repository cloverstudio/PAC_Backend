import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import spikaLogoPic from '../assets/img/logoLight.png';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';

class Main extends Component {

    static propTypes = {
    }

    toggleNotification = (e) => {
        if(!this.props.notificationState)
            this.props.showNotifications();
        else
            this.props.hideNotifications();
    }

    hideNotification = (e) => {
        if(! /topbar-btn|bell/.test(e.target.className))
            this.props.hideNotifications();
    }

    render() {
        
        let dropdownMenuClass = "dropdown-menu dropdown-menu-right";
        if(this.props.notificationState)
            dropdownMenuClass += " show";

        return (
            <div className="pace-done sidebar-folded" onClick={this.hideNotification}>
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
                        </ul>
                    </nav>

                </aside>

                <header className="topbar">

                    <div className="topbar-left">
                        <span className="topbar-btn sidebar-toggler"><i>&#9776;</i></span>
                    </div>

                    <div className="topbar-right">
                        <a className="topbar-btn" href="#qv-global" data-toggle="quickview"><i className="fa fa-user"></i></a>
                        <a className="topbar-btn" href="#qv-global" data-toggle="quickview"><i className="fa fa-users"></i></a>

                        <div className="topbar-divider"></div>

                        <ul className="topbar-btns">

                            <li className="dropdown d-none d-md-block">
                                
                                <span className="topbar-btn has-new" onClick={this.toggleNotification}>
                                    <i className="fa fa-bell-o"></i>
                                </span>

                                <div className={dropdownMenuClass}>

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

                <main className="layout-chat">

                    <aside className="aside aside-lg aside-expand-lg">
                        <div className="aside-body pt-0">
                        <div className="media-list media-list-divided media-list-hover">

                            <header className="media-list-header b-0">
                            <form className="lookup lookup-lg w-100 bb-1 border-light">
                                <input className="w-100 no-radius no-border py-30" type="text" placeholder="Search..." data-provide="media-search" />
                            </form>
                            </header>

                            <div className="media-list-body">
                            <a className="media align-items-center active" href="#">
                                <span className="avatar status-success">
                                <img src="../assets/img/avatar/1.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Maryam Amiri</strong>
                                    <time datetime="2017-07-14 20:00">12:11</time>
                                    <span className="badge badge-pill badge-primary">3</span>
                                </div>
                                <p className="text-truncate">You need to update the changelog in documentation before we release the current version.</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-warning">
                                <img src="../assets/img/avatar/2.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Patric Johnson</strong>
                                    <time datetime="2017-07-14 20:00">09:34</time>
                                    <span className="badge badge-pill badge-primary">1</span>
                                </div>
                                <p className="text-truncate">Ok, I'll take care of it</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-danger">
                                <img src="../assets/img/avatar/3.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Sarah Conner</strong>
                                    <time datetime="2017-07-14 20:00">04:29</time>
                                </div>
                                <p className="text-truncate">Good Morning!</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-warning">
                                <img src="../assets/img/avatar/default.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Teisha Hummel</strong>
                                    <time datetime="2017-07-14 20:00">Yesterday</time>
                                </div>
                                <p className="text-truncate">Bye</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-success">
                                <img src="../assets/img/avatar/5.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Bobby Mincy</strong>
                                    <time datetime="2017-07-14 20:00">Yesterday</time>
                                </div>
                                <p className="text-truncate">See you then</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-danger">
                                <img src="../assets/img/avatar/6.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Tim Hank</strong>
                                    <time datetime="2017-07-14 20:00">2 days ago</time>
                                </div>
                                <p className="text-truncate">Continually grow corporate solutions rather than ethical.</p>
                                </div>
                            </a>


                            <a className="media align-items-center" href="#">
                                <span className="avatar status-success">
                                <img src="../assets/img/avatar/8.jpg" alt="..." />
                                </span>
                                <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Fidel Tonn</strong>
                                    <time datetime="2017-07-14 20:00">2 days ago</time>
                                </div>
                                <p className="text-truncate">Foster resource maximizing niches before high standards.</p>
                                </div>
                            </a>
                            </div>

                        </div>
                        </div>

                        <button className="aside-toggler"></button>
                    </aside>


                    <div className="main-content">

                        <div className="chat-container card card-bordered flex-column">

                        <header className="flexbox align-items-center p-12 pr-20 bg-lighter bb-1 border-light">
                            <div className="media align-items-center p-0">
                            <a href="#"><img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." /></a>
                            <div className="media-body">
                                <h6><a href="#">Maryam Amiri</a></h6>
                                <small>Typing...</small>
                            </div>
                            </div>

                            <div className="dropdown">
                            <a className="text-lighter" data-toggle="dropdown" href="#"><i className="ti-more-alt rotate-90"></i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                                <a className="dropdown-item" href="#"><i className="fa fa-fw fa-user"></i> Profile</a>
                                <a className="dropdown-item" href="#"><i className="fa fa-fw fa-picture-o"></i> Medias</a>
                                <a className="dropdown-item" href="#"><i className="fa fa-fw fa-volume-off"></i> Mute</a>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#"><i className="fa fa-fw fa-trash"></i> Delete</a>
                            </div>
                            </div>
                        </header>

                        <div className="scrollable flex-grow" id="chat-content" data-provide="emoji">

                            <div className="media media-chat">
                            <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                            <div className="media-body">
                                <p>Hi</p>
                                <p>How are you ...???</p>
                                <p>What are you doing tomorrow?<br />Would you like to get out of the town for a while?</p>
                                <p className="meta"><time datetime="2017">23:58</time></p>
                            </div>
                            </div>

                            <div className="media media-meta-day">Today</div>

                            <div className="media media-chat media-chat-reverse">
                            <div className="media-body">
                                <p>Hiii, I'm good.</p>
                                <p>How are you doing?</p>
                                <p>Long time no see!</p>
                                <p className="meta"><time datetime="2017">00:06</time></p>
                            </div>
                            </div>

                            <div className="media media-chat">
                            <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                            <div className="media-body">
                                <p>Yeah</p>
                                <p>We were out of country for a vacation. We visited several beautiful countries and made a lot of memmories. :stuck_out_tongue_winking_eye: :stuck_out_tongue_winking_eye:</p>
                                <p className="meta"><time datetime="2017">00:07</time></p>
                            </div>
                            </div>

                            <div className="media media-chat media-chat-reverse">
                            <div className="media-body">
                                <p>That's awesome!</p>
                                <p>You should tell me everything with all small details. I'm so curious to hear your stories.</p>
                                <p>Did you take pictures?</p>
                                <p className="meta"><time datetime="2017">00:09</time></p>
                            </div>
                            </div>

                            <div className="media media-chat">
                            <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                            <div className="media-body">
                                <p>We took a loooot. Here is some of them, I'll show you the rest once we meet.</p>
                                <p className="row gap-1" data-provide="photoswipe">
                                <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/8.jpg" alt="..." /></a>
                                <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/11.jpg" alt="..." /></a>
                                <a className="col-4 d-inline-block" href="#"><img src="../assets/img/gallery/thumb-sm/7.jpg" alt="..." /></a>
                                </p>
                                <p className="meta"><time datetime="2017">00:10</time></p>
                            </div>
                            </div>

                            <div className="media media-chat media-chat-reverse">
                            <div className="media-body">
                                <p>These places are fantastic. Wish I could join you guys :disappointed: :disappointed:</p>
                                <p className="meta"><time datetime="2017">00:10</time></p>
                            </div>
                            </div>

                            <div className="media media-chat">
                            <img className="avatar" src="../assets/img/avatar/1.jpg" alt="..." />
                            <div className="media-body">
                                <p>You can actually. We are planning our next vacation for new year holidays :wink:</p>
                                <p className="meta"><time datetime="2017">00:12</time></p>
                            </div>
                            </div>

                            <div className="media media-chat media-chat-reverse">
                            <div className="media-body">
                                <p>Are you serious?!! :heart_eyes:</p>
                                <p className="meta"><time datetime="2017">00:12</time></p>
                            </div>
                            </div>

                        </div>

                        <footer className="publisher">
                            <img className="avatar align-self-start" src="../assets/img/avatar/2.jpg" alt="..." />
                            <input className="publisher-input" rows="1" placeholder="Write something" />
                            <div className="align-self-end gap-items">
                                <span className="publisher-btn file-group">
                                    <i className="fa fa-paperclip file-browser"></i>
                                    <input type="file" />
                                </span>
                                <a className="publisher-btn" href="#"><i className="fa fa-smile-o"></i></a>
                                <a className="publisher-btn" href="#"><i className="fa fa-paper-plane"></i></a>
                            </div>
                        </footer>
                        </div>

                    </div>

                </main>

            </div>
        );
        
    }

}

const mapStateToProps = (state) => {
    return {
        notificationState:state.main.notificationState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showNotifications: () => dispatch(actions.main.showNotification()),
        hideNotifications: () => dispatch(actions.main.hideNotification()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Main);
