import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';

import AvatarImage from '../AvatarImage.js';

class ChatHeader extends Component {

    static propTypes = {
    }
    constructor(){
        super();
    }

    render() {
        return(
            <header className="flexbox align-items-center p-12 pr-20 bg-lighter bb-1 border-light">
                <div className="media align-items-center p-0">

                    <AvatarImage 
                        fileId={this.props.chatAvatar.fileId} 
                        type={this.props.chatAvatar.type} />

                    <div className="media-body">
                        <h6>{this.props.chatAvatar.name}</h6>
                        <small>{(()=>{
                            const users = Object.values(this.props.UsersTyping);
                            const len = users.length;
                            
                            if (len === 1){
                                return users[0]+' is typing...';
                            }
                            else if(len >= 2){
                                let typingStr = users.slice(0, len-1).join(', ');
                                typingStr+= ` and ${users[len-1]} are typing...`
                                return typingStr;
                            }
                            else{
                                return null;
                            }
                        })()}</small>
                    </div>
                    
                </div>
            </header>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        chatAvatar:state.chat.chatAvatar,
        UsersTyping: state.chat.typing        
    };
};

const mapDispatchToProps = (dispatch) => {
    return {  
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatHeader);
