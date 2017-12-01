import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as config from '../../lib/config';
import * as utils from '../../lib/utils';
import * as actions from '../../actions';

import user from '../../lib/user';

import AvatarImage from '../AvatarImage';
import SimpleWebRTC from '../../lib/SimpleWebRTC/src/simplewebrtc';

import MicOnImage from '../../assets/img/mic-on.svg';
import MicOffImage from '../../assets/img/mic-off.svg';
import CamOnImage from '../../assets/img/cam-on.svg';
import CamOffImage from '../../assets/img/cam-off.svg';
import HangupImage from '../../assets/img/hangup.svg';
import ArrowDownImage from '../../assets/img/arrow-down.svg';

class CallingDialog extends Component {

    static propTypes = {
    }

    componentWillReceiveProps(nextProps){

        if(this.props.calling != nextProps.calling && nextProps.calling){

            const targetUser = this.props.incomingCallUser || this.props.outgoingCallUser;
            this.roomId = utils.chatIdByUser(targetUser);

            var media = {
                video: true,
                audio: true
            };

            media.video = { 
                "width": {
                    "min": "480",
                    "max": "480"
                },
                "height": {
                    "min": "320",
                    "max": "320"
                },
                "frameRate": {
                    "min": "8",
                    "max": "8"
                }
            };

            // init simplewebrtc
            this.webRTC = new SimpleWebRTC({
                debug: true,
                localVideoEl: 'video-mine',
                remoteVideosEl: 'video-target',
                url: config.SignalingServerURL + "/signaling", // socket.io name space
                autoRequestMedia: true,
                media: media,
                peerConnectionConfig  : {
                    iceTransports : "all"
                },
                socketio : {
                    transports: ['websocket'], 
                    upgrade: false
                }
            });

            this.webRTC.on('readyToCall', () => {
                this.webRTC.joinRoom(this.roomId);
            });

        }

    }

    render() {
        
        let mainClass = "modal modal-fill calling";
        if(this.props.calling)
            mainClass += " show";

        return (

            <div className={mainClass}>
                
                <div className="row">

                    <div className="offset-md-1 col-md-10 videos">
                        
                        <div className="target-video-holder" id="video-target">

                            

                        </div>

                        <div className="my-video-holder" id="video-mine">


                            
                        </div>

                        <div className="buttons-holder">

                            <button className="btn btn-square btn-round btn-success">
                                <img src={MicOnImage} />
                            </button>
                            <button className="btn btn-square btn-round btn-danger">
                                <img src={MicOffImage} />
                            </button>
                            <button className="btn btn-square btn-round btn-success">
                                <img src={CamOnImage} />
                            </button>
                            <button className="btn btn-square btn-round btn-danger">
                                <img src={CamOffImage} />
                            </button>
    
                            <button className="btn btn-square btn-round btn-danger">
                                <img src={HangupImage} />
                            </button>

                            <button className="btn btn-square btn-round btn-success">
                                <img src={ArrowDownImage} />
                            </button>

                        </div>  

                    </div>

                </div>

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        calling: state.call.calling,
        incomingCallUser: state.call.incomingCallUser,
        outgoingCallUser: state.call.outgoingCallUser
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CallingDialog);
