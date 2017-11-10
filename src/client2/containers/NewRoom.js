import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

import user from '../lib/user';
import {store} from '../index';

import Base from './Base';

import Toast from '../components/Toast';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';

class NewRoom extends Base {

    static propTypes = {
    }
    
    render() {
        
        return (
            <div className="pace-done sidebar-folded" onClick={this.globalClick}>
            
                <SideBar />
                <Header />

                <main className="layout-chat">
                
                    <History />

                    <div className="main-content new-room">

                        <div className="col-12 pt-15">
                            <div className="card">
                            <h4 className="card-title"> Create New room</h4>

                            <div className="card-body p-20">
                                <div className="row">


                                    <div className="col-md-4">
                                        <label>Users</label>

                                        <div className="input-group">
                                            <span className="input-group-addon" id="basic-addon1"><i className="ti-search"></i></span>
                                            <input type="text" className="form-control" placeholder="User Name" />
                                        </div>
                                        
                                        <div className="media-list user-picker b-1">
                                            
                                            <div className="media media-single media-action-visible">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <span className="title">Item to delete</span>
                                                <a className="media-action hover-success" href="#" data-provide="tooltip" title="Delete"><i className="ti-plus"></i></a>
                                            </div>


                                            <div className="media media-single media-action-visible">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <span className="title">Item to delete</span>
                                                <a className="media-action hover-success" href="#" data-provide="tooltip" title="Delete"><i className="ti-plus"></i></a>
                                            </div>

                                            <div className="media media-single media-action-visible">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <span className="title">Item to delete</span>
                                                <a className="media-action hover-success" href="#" data-provide="tooltip" title="Delete"><i className="ti-plus"></i></a>
                                            </div>

                                            <div className="media media-single media-action-visible">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <span className="title">Item to delete</span>
                                                <a className="media-action hover-success" href="#" data-provide="tooltip" title="Delete"><i className="ti-plus"></i></a>
                                            </div>
                                        </div>
                                        

                                        <br />

                                        <label>Selected Users</label>
                                        <div className="media-list media-list-hover">
                                            <div className="media items-center">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <a className="title hover-primary" href="#">Maryam Amiri</a>
                                                <a className="media-action hover-danger" href="#"><i className="fa fa-close"></i></a>
                                            </div>

                                            <div className="media items-center">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <a className="title hover-primary" href="#">Maryam Amiri</a>
                                                <a className="media-action hover-danger" href="#"><i className="fa fa-close"></i></a>
                                            </div>

                                            <div className="media items-center">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <a className="title hover-primary" href="#">Maryam Amiri</a>
                                                <a className="media-action hover-danger" href="#"><i className="fa fa-close"></i></a>
                                            </div>

                                            <div className="media items-center">
                                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                                <a className="title hover-primary" href="#">Maryam Amiri</a>
                                                <a className="media-action hover-danger" href="#"><i className="fa fa-close"></i></a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label>Room Name</label>

                                        <div className="input-group">
                                           <input type="text" className="form-control" placeholder="Room Name" />
                                        </div>

                                        <br />

                                        <label>Description</label>
                                        <div className="input-group">
                                            <textarea type="text" className="form-control" placeholder="User Name" ></textarea>
                                        </div>

                                        <br />

                                        <label>Avatar Image</label>
                                        <div className="input-group file-group">
                                            <input type="text" className="form-control file-value" placeholder="Choose file..." readonly="" />
                                            <input type="file" multiple="" />
                                            <span className="input-group-btn">
                                                <button className="btn btn-light file-browser" type="button"><i className="fa fa-upload"></i></button>
                                            </span>
                                        </div>
                                        
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    </div>

                </main>
                
                <Toast />
                
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
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewRoom);
