import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';

import AvatarImage from '../AvatarImage';
import DateTime from '../DateTime';


class HistoryRow extends Component {

    static propTypes = {
    }

    constructor(){
        super();
    }

    selected = () => {

        if(this.props.history.chatType == constant.ChatTypePrivate){
            this.props.openChatByUser(this.props.history.user);
        }
        else if(this.props.history.chatType == constant.ChatTypeGroup){
            this.props.openChatByGroup(this.props.history.group);
        }
        else if(this.props.history.chatType == constant.ChatTypeRoom){
            this.props.openChatByRoom(this.props.history.room);
        }
        
    }

    render() {

        const history = this.props.history;

        let fileId = "";
        
        const user = history.user;
        const group = history.group;
        const room = history.room;
        let userClass = "avatar ";

        if(user && user.avatar && user.avatar.thumbnail){
            fileId = user.avatar.thumbnail.nameOnServer;
        }

        if(user && user.onlineStatus == 1)
            userClass += " status-success";
        
        if(group && group.avatar && group.avatar.thumbnail)
            fileId = group.avatar.thumbnail.nameOnServer;
    
    
        if(room && room.avatar && room.avatar.thumbnail)
            fileId = room.avatar.thumbnail.nameOnServer;
        
        let lastMessage = "";

        if(history.lastMessage)
            lastMessage = history.lastMessage.message;
            
        return (
                <div className="history-row" onClick={this.selected}>

                    {history.chatType == constant.ChatTypePrivate ?
                        <div className={"media align-items-center"}>
                            <span className={userClass}>
                                <AvatarImage fileId={fileId} type={constant.AvatarUser} />
                            </span>
                            <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">{user.name}</strong>
                                    <DateTime timestamp={history.lastUpdate} />
                                    {history.unreadCount > 0 ?
                                        <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                        :null
                                    }                                
                                </div>
                                <p className="text-truncate">
                                    {lastMessage}
                                </p>
                            </div>
                        </div> : null
                    }

                    {history.chatType == constant.ChatTypeGroup ?
                        <div className="media align-items-center">
                            <span className="avatar">
                                <AvatarImage fileId={fileId} type={constant.AvatarGroup}  />
                            </span>
                            <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">{group.name}</strong>
                                    <DateTime timestamp={history.lastUpdate} />
                                    {history.unreadCount > 0 ?
                                        <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                        :null
                                    }
                                </div>
                                <p className="text-truncate">
                                    {lastMessage}
                                </p>
                            </div>
                        </div> : null
                    }

                    {history.chatType == constant.ChatTypeRoom ?
                        <div className="media align-items-center">
                            <span className="avatar">
                                <AvatarImage fileId={fileId} type={constant.AvatarRoom}  />
                            </span>
                            <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">{room.name}</strong>
                                    <DateTime timestamp={history.lastUpdate} />
                                    {history.unreadCount > 0 ?
                                        <span className="badge badge-pill badge-primary">{history.unreadCount}</span>
                                        :null
                                    }                                
                                </div>
                                <p className="text-truncate">
                                    {lastMessage}
                                </p>
                            </div>
                        </div> : null
                    }
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
        openChatByUser: user => dispatch(actions.chat.openChatByUser(user)),
        openChatByGroup: group => dispatch(actions.chat.openChatByGroup(group)),
        openChatByRoom: room => dispatch(actions.chat.openChatByRoom(room)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HistoryRow);
