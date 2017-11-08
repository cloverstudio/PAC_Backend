import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';

import AvatarImage from '../AvatarImage';

class Information extends Component {

    static propTypes = {
    }

    render() {

        return (
            
            <div className="info-container bg-lighter border-light">

                <div className="spinner-linear">
                    <div className="line"></div>
                </div>
                
                <div className="quickview-body ps-container ps-theme-default">

                    <div className="card card-inverse bg-img" >

                        <div className="card-body text-center pt-50 pb-50">
                            
                            <AvatarImage 
                                className="avatar avatar-xxl avatar-bordered" 
                                fileId="Nj0P6WBnME1CLYVgjsT5IzQom50n1OSa" 
                                type={constant.AvatarRoom} 
                            />
                            
                            <h4 className="mt-2 mb-0">
                                <span className="hover-primary text-white">Maryam Amiri</span>
                            </h4>

                        </div>

                    </div>

                </div>

                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info">
                    <li className="nav-item">
                        <a className="nav-link active">Settings</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link">Members</a>
                    </li>
                </ul>

                <div className="tab-content">
                    <div className="tab-pane fade active show">
                        <div className="media">
                            <div className="media-body">
                                <p><strong>Notification</strong></p>
                                <p>This room is muted.</p>
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                        
                        <div className="media">
                            <div className="media-body">
                                <p><strong>Block</strong></p>
                                <p>This user is not blocked.</p>
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>
                    </div>
                    <div className="tab-pane fade show">
                        <div className="media-list media-list-hover">
                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                            <p className="title">Maryam Amiri</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/2.jpg" alt="..." />
                            <p className="title">Hossein Shams</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-secondary">LB</span>
                            <p className="title">Luz Buchler</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/3.jpg" alt="..." />
                            <p className="title">Tim Hank</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-dark">KC</span>
                            <p className="title">Karla Cardinal</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-brown">GS</span>
                            <p className="title">Gena Stepney</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/4.jpg" alt="..." />
                            <p className="title">Frank Camly</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-pink">TH</span>
                            <p className="title">Teisha Hummel</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/5.jpg" alt="..." />
                            <p className="title">Bobby Mincy</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/6.jpg" alt="..." />
                            <p className="title">Gary Camara</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-purple">PB</span>
                            <p className="title">Pricilla Beaird</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-gray">VB</span>
                            <p className="title">Vernice Begay</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-primary">LP</span>
                            <p className="title">Luz Pintor</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/2.jpg" alt="..." />
                            <p className="title">Garret Gloss</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/3.jpg" alt="..." />
                            <p className="title">Fidel Tonn</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-info">ED</span>
                            <p className="title">Eulah Deweese</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-success">ZS</span>
                            <p className="title">Zora Sieber</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <img className="avatar avatar-sm" src="../assets/img/avatar/5.jpg" alt="..." />
                            <p className="title">Bobby Mincy</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-warning">EW</span>
                            <p className="title">Emilia Weber</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>

                        <div className="media items-center">
                            <span className="avatar avatar-sm bg-danger">AW</span>
                            <p className="title">Aja Weedon</p>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                            <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                        </div>
                        </div>
                    </div>

                    <div className="tab-pane fade" id="qv-tab-noti" aria-expanded="false">
                        <div className="media-list media-list-hover media-list-divided">
                        <a className="media media-new" href="#">
                            <span className="avatar bg-success"><i className="ti-user"></i></span>
                            <div className="media-body">
                            <p>New user registered</p>
                            <time datetime="2017-07-14 20:00">Just now</time>
                            </div>
                        </a>

                        <a className="media media-new" href="#">
                            <span className="avatar bg-info"><i className="ti-shopping-cart"></i></span>
                            <div className="media-body">
                            <p>New order received</p>
                            <time datetime="2017-07-14 20:00">2 min ago</time>
                            </div>
                        </a>

                        <a className="media media-new" href="#">
                            <span className="avatar bg-warning"><i className="ti-face-sad"></i></span>
                            <div className="media-body">
                            <p>Refund request from <b>Ashlyn Culotta</b></p>
                            <time datetime="2017-07-14 20:00">24 min ago</time>
                            </div>
                        </a>

                        <a className="media media-new" href="#">
                            <span className="avatar bg-primary"><i className="ti-money"></i></span>
                            <div className="media-body">
                            <p>New payment has made through PayPal</p>
                            <time datetime="2017-07-14 20:00">53 min ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-danger"><i className="ti-package"></i></span>
                            <div className="media-body">
                            <p>Package lost on the way!</p>
                            <time datetime="2017-07-14 20:00">1 hour ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-success"><i className="ti-user"></i></span>
                            <div className="media-body">
                            <p>New user registered</p>
                            <time datetime="2017-07-14 20:00">1 hour ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-purple"><i className="ti-comment"></i></span>
                            <div className="media-body">
                            <p>New review on <em>iPhone 6s</em></p>
                            <time datetime="2017-07-14 20:00">3 hours ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-info"><i className="ti-shopping-cart"></i></span>
                            <div className="media-body">
                            <p>New order received</p>
                            <time datetime="2017-07-14 20:00">5 hours ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-danger"><i className="fa fa-area-chart"></i></span>
                            <div className="media-body">
                            <p>CPU usage went above 80%</p>
                            <time datetime="2017-07-14 20:00">Yesterday</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-yellow"><i className="fa fa-star"></i></span>
                            <div className="media-body">
                            <p>New rating on iPhone 6s, 5 star</p>
                            <time datetime="2017-07-14 20:00">Yesterday</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-success"><i className="ti-user"></i></span>
                            <div className="media-body">
                            <p>New user registered</p>
                            <time datetime="2017-07-14 20:00">Yesterday</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-primary"><i className="ti-money"></i></span>
                            <div className="media-body">
                            <p>New payment has made through PayPal</p>
                            <time datetime="2017-07-14 20:00">2 days ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-info"><i className="ti-shopping-cart"></i></span>
                            <div className="media-body">
                            <p>New order received</p>
                            <time datetime="2017-07-14 20:00">2 days ago</time>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar bg-purple"><i className="ti-comment"></i></span>
                            <div className="media-body">
                            <p>New review on Samsung Galaxy S7</p>
                            <time datetime="2017-07-14 20:00">Aug 17</time>
                            </div>
                        </a>
                        </div>
                    </div>

                    <div className="tab-pane fade" id="qv-tab-msg" aria-expanded="false">
                        <div className="media-list media-list-divided media-list-hover">
                        <a className="media media-new" href="#">
                            <span className="avatar status-success">
                            <img src="../assets/img/avatar/1.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Maryam Amiri</strong> <time className="float-right" datetime="2017-07-14 20:00">23 min ago</time></p>
                            <p>Authoritatively exploit resource maximizing technologies before technically.</p>
                            </div>
                        </a>

                        <a className="media media-new" href="#">
                            <span className="avatar status-warning">
                            <img src="../assets/img/avatar/2.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Hossein Shams</strong> <time className="float-right" datetime="2017-07-14 20:00">48 min ago</time></p>
                            <p>Continually plagiarize efficient interfaces after bricks-and-clicks niches.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-dark">
                            <img src="../assets/img/avatar/3.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Helen Bennett</strong> <time className="float-right" datetime="2017-07-14 20:00">3 hours ago</time></p>
                            <p>Objectively underwhelm cross-unit web-readiness before sticky outsourcing.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-success bg-purple">FT</span>

                            <div className="media-body">
                            <p><strong>Fidel Tonn</strong> <time className="float-right" datetime="2017-07-14 20:00">21 hours ago</time></p>
                            <p>Interactively innovate transparent relationships with holistic infrastructures.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-danger">
                            <img src="../assets/img/avatar/4.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Freddie Arends</strong> <time className="float-right" datetime="2017-07-14 20:00">Yesterday</time></p>
                            <p>Collaboratively visualize corporate initiatives for web-enabled value.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-success">
                            <img src="../assets/img/avatar/5.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Garret Gloss</strong> <time className="float-right" datetime="2017-07-14 20:00">Yesterday</time></p>
                            <p>Competently plagiarize visionary outsourcing after turnkey outside.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-success bg-pink">EA</span>

                            <div className="media-body">
                            <p><strong>Ena Avelar</strong> <time className="float-right" datetime="2017-07-14 20:00">2 days ago</time></p>
                            <p>Holisticly restore resource maximizing mindshare before visionary.</p>
                            </div>
                        </a>

                        <a className="media" href="#">
                            <span className="avatar status-warning">
                            <img src="../assets/img/avatar/6.jpg" alt="..." />
                            </span>

                            <div className="media-body">
                            <p><strong>Enoch Keach</strong> <time className="float-right" datetime="2017-07-14 20:00">2 days ago</time></p>
                            <p>Efficiently strategize resource sucking alignments after competitive.</p>
                            </div>
                        </a>
                        </div>
                    </div>

                </div>

                {/*
                <div className="media">
                    <div className="media-body">
                        <p><strong>Notification</strong></p>
                        <p>This room is muted.</p>
                    </div>
                    <label className="switch switch-lg">
                        <input type="checkbox" />
                        <span className="switch-indicator"></span>
                    </label>
                </div>

                
                <div className="media">
                    <div className="media-body">
                        <p><strong>Block</strong></p>
                        <p>This user is not blocked.</p>
                    </div>
                    <label className="switch switch-lg">
                        <input type="checkbox" />
                        <span className="switch-indicator"></span>
                    </label>
                </div>
                
                <div className="media-list media-list-hover">

                    <div className="media items-center">
                        <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                        <p className="title">Maryam Amiri</p>
                        <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
                    </div>
                    
                </div>
                */}

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
)(Information);
