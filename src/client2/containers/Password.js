import PropTypes, { string } from 'prop-types';
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

import Modals from '../components/Modals';
import SideBar from '../components/chat/SideBar';
import Header from '../components/chat/Header';
import History from '../components/chat/History';
import AvatarImage from '../components/AvatarImage';
import DateTime from '../components/DateTime';

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
        
        let sideBarClass = "pace-done sidebar-folded";
        if(this.props.sidebarState)
            sideBarClass += " sidebar-open";

        let asideBarHolderClass = "layout-chat";
        if(this.props.historyBarState)
            asideBarHolderClass += " aside-open";

        return (

            <div className={sideBarClass} onClick={this.globalClick}>
            
                <SideBar />
                <Header />

                <main className={asideBarHolderClass}>
                
                    {this.props.isLoading ?
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

                    <div className="main-content password">

                        <div className="col-12 pt-15">

                            <div className="card">

                                <div className="card-body p-20">

                                    <label>{strings.ProfileName[user.lang]}</label>
                                    <div className="input-group">
                                        <input type="text" value="" className="form-control" placeholder={strings.RoomName[user.lang]} onChange={ e => { this.props.typeName ( e.target.value ) }}/>
                                    </div>

                                    <br />

                                    <label>{strings.ProfileDescription[user.lang]}</label>
                                    <div className="input-group">
                                        <textarea type="text" value="" className="form-control" placeholder={strings.Description[user.lang]} onChange={ e => { this.props.typeDescription ( e.target.value ) }} />
                                    </div>

                                    <br />

                                    <label>{strings.ProfileAvatar[user.lang]}</label>
                                    <div className="input-group">
                                        <input type="file" value="" className="form-control" placeholder={strings.Description[user.lang]} onChange={ e => { this.props.typeDescription ( e.target.value ) }} />
                                    </div>

                                    <br />

                                    <div className="text-right">
                                            
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
)(Password);
