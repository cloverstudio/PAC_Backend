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

class NewRoom extends Base {

    constructor() {
        super();

        this.roomId = "";

    }

    static propTypes = {
    }
    
    onInputKeyword = (e) => {

        e.persist();
        
        this.props.typeKeyword(e.target.value);

        clearTimeout(this.lastSearchTimeout);

        this.lastSearchTimeout = setTimeout( () =>{
            this.props.searchUserList(e.target.value)
        }, constant.SearchInputTimeout);

    }

    onAddMember = (user) => {
        this.props.addMember(user);
    }

    onDeleteMember = (user) => {
        this.props.deleteMember(user);
    }

    onOpenFileSelect = (e) => {
        this.fileInput.click();
    }
    
    componentWillReceiveProps(nextProps) {
        
        if(this.props.editingRoomId != nextProps.editingRoomId){
            
            this.updateView();
        }

    }

    componentDidMount() {
        
        this.updateView();

    }
    
    updateView = () => {

        if(this.props.editingRoomId != null){

            this.props.initRoomEdit(this.props.editingRoomId);

        } else {

            this.props.typeName('');

        }
        
    }

    render() {
        
        const mode = this.props.editingRoomId != null ? constant.RoomModeEdit : constant.RoomModeCreate;

        return (
            <div className="pace-done sidebar-folded" onClick={this.globalClick}>
            
                <SideBar />
                <Header />

                <main className="layout-chat">
                
                    <History />

                    <div className="main-content new-room">

                        <div className="col-12 pt-15">

                            {this.props.saving ?
                                <div className="spinner-linear">
                                    <div className="line"></div>
                                </div> : null
                            }

                            <div className="card">
                            
                            <h4 className="card-title"> 

                                {mode == constant.RoomModeCreate ?
                                    <span>{strings.CreateRoom[user.lang]}</span> : null
                                }

                                {mode == constant.RoomModeEdit ?
                                    <span>
                                        {strings.EditRoom[user.lang]}
                                          &nbsp;&nbsp;<strong>{this.props.name}</strong>
                                    </span> : null
                                }
                                
                            </h4>

                            <div className="card-body p-20">

                                <div className="row">

                                    <div className="col-md-4 users-container">

                                        <label>{strings.UsersTitle[user.lang]}</label>

                                        <div className="input-group">
                                            <span className="input-group-addon" id="basic-addon1"><i className="ti-search"></i></span>
                                            <input type="text" value={this.props.keyword} onChange={this.onInputKeyword} className="form-control" placeholder={strings.UserName[user.lang]} />
                                        </div>
                                        <small className="form-text">{strings.UserNameHelp[user.lang]}</small>
                                    
                                        <div className="user-picker-container">

                                            {this.props.isSearchLoading && this.props.keyword.length ?
                                                <div className="spinner-linear">
                                                    <div className="line"></div>
                                                </div> : null}

                                            {this.props.keyword.length > 0 && !this.props.isSearchLoading ? 

                                                <div className="media-list user-picker b-1">
                                                    
                                                    {this.props.searchResult.length > 0 ? 

                                                        <div>
                                                            {this.props.searchResult.map( (user) => {

                                                                let fileId = null;

                                                                if(user.avatar && user.avatar.thumbnail)
                                                                    fileId = user.avatar.thumbnail.nameOnServer;

                                                                return <div className="media media-single media-action-visible cursor-pointer" key={user._id} onClick={ () => { this.onAddMember(user) }}>
                                                                    <AvatarImage className="avatar-sm" fileId={fileId} type={constant.AvatarUser} />
                                                                    <span className="title">{user.name}</span>
                                                                    <a className="media-action hover-success" href="javascript:void(0)" ><i className="ti-plus"></i></a>
                                                                </div>
                                                            })}
                                                        </div>

                                                        : <div className="media media-single media-action-visible"> 
                                                            {strings.NoUserFound[user.lang]}
                                                        </div>
                                                    }

                                                </div> : null

                                            }
                                        
                                        </div>

                                        <br />

                                        <label className="mt-20">{strings.SelectedUsers[user.lang]}</label>
                                        <div className="media-list media-list-hover ">

                                            {this.props.members.map( (user) => {

                                                let fileId = null;

                                                if(user.avatar && user.avatar.thumbnail)
                                                    fileId = user.avatar.thumbnail.nameOnServer;

                                                return <div className="media media-single media-action-visible cursor-pointer" key={user._id} onClick={ () => { this.onDeleteMember(user) }}>
                                                    <AvatarImage className="avatar-sm" fileId={fileId} type={constant.AvatarUser} />
                                                    <a className="title" href="javascript:void(0)">{user.name}</a>
                                                    <a className="media-action" href="javascript:void(0)"><i className="fa fa-close"></i></a>
                                                </div>
                                            })}

                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label>{strings.RoomName[user.lang]}</label>

                                        <div className="input-group">
                                           <input type="text" value={this.props.name} className="form-control" placeholder={strings.RoomName[user.lang]} onChange={ e => { this.props.typeName ( e.target.value ) }}/>
                                        </div>

                                        <br />

                                        <label>{strings.Description[user.lang]}</label>
                                        <div className="input-group">
                                            <textarea type="text" value={this.props.description} className="form-control" placeholder={strings.Description[user.lang]} onChange={ e => { this.props.typeDescription ( e.target.value ) }} />
                                        </div>

                                        <br />
                                        
                                        {this.props.avatarImage ?
                                            <div className="media flex-column b-1 p-0">
                                                <div className="flexbox bg-pale-secondary bt-1 border-light px-12 py-10">
                                                    <span className="flex-grow">{this.props.avatarImage.name}</span>
                                                    <a className="media-action" href="javascript:void(0)" title="Delete" onClick={this.props.deleteFile}><i className="ti-close"></i></a>
                                                </div>
                                                <span className="m-auto">
                                                    <img className="m-1 b-1 img-fluid h-250px " src={this.props.avatarImageUrl} />
                                                </span>
                                            </div> : null
                                        }

                                        <br />
                                        
                                        {!this.props.avatarImage ?
                                            <div>
                                                <label>{strings.AvatarImage[user.lang]}</label>
                                                <div className="input-group file-group">
                                                    <input type="text" className="form-control file-value" placeholder={strings.ChooseFile[user.lang]} readonly="" />
                                                    <input type="file" ref={(ref) => this.fileInput = ref} onChange={ e => { this.props.selectFile(e.target.files[0]) }} accept="image/*"/>
                                                    <span className="input-group-btn">
                                                        <button className="btn btn-light file-browser" type="button" onClick={this.onOpenFileSelect}><i className="fa fa-upload"></i></button>
                                                    </span>
                                                </div> 
                                            </div>: null
                                        }

                                    </div>

                                </div>

                                <div className="row button-container mt-20">
                                    
                                    <div className="col-md-4"></div>

                                    <div className="col-md-4 text-right">
                                            
                                        <button onClick={this.props.cancel} className="btn btn-w-md btn-danger">{strings.Cancel[user.lang]}</button>
                                        <button onClick={this.props.save} className="btn btn-w-md btn-info">{strings.Save[user.lang]}</button>
                                        
                                    </div>

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
        isSearchLoading: state.room.loading,
        keyword: state.room.keyword,
        searchResult: state.room.searchResult,
        members: state.room.members,
        avatarImage: state.room.avatarImage,
        avatarImageUrl: state.room.avatarImageUrl,
        saving: state.room.saving,
        keyword: state.room.keyword,
        name: state.room.name,
        description: state.room.description,
        sidebarState: state.chatUI.sidebarState,
        historyBarState: state.chatUI.historyBarState,
        editingRoomId: state.room.editingRoomId
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideNotifications: () => dispatch(actions.chatUI.hideNotification()),
        hideUsersView: () => dispatch(actions.chatUI.hideUsersView()),
        hideGroupsView: () => dispatch(actions.chatUI.hideGroupsView()),
        searchUserList: (value) => dispatch(actions.room.searchUserList(value)),
        cancel: () => dispatch(actions.room.cancel()),
        save: () => dispatch(actions.room.save()),
        addMember: user => dispatch(actions.room.addMember(user)),
        deleteMember: user => dispatch(actions.room.deleteMember(user)),
        typeKeyword: keyword => dispatch(actions.room.typeKeyword(keyword)),
        typeName: name => dispatch(actions.room.typeName(name)),
        typeDescription: description => dispatch(actions.room.typeDescription(description)),
        selectFile: file => dispatch(actions.room.selectFile(file)),
        deleteFile: file => dispatch(actions.room.deleteFile()),
        hideStickersView: () => dispatch(actions.chatUI.hideStickersView()),
        hideSidebar: () => dispatch(actions.chatUI.hideSidebar()),
        hideHistory: () => dispatch(actions.chatUI.hideHistory()),
        initRoomEdit: (roomId) => dispatch(actions.room.initRoomEdit(roomId)),
        
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewRoom);
