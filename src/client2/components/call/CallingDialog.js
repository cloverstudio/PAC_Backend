import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import * as constant from "../../lib/const";
import * as config from "../../lib/config";
import * as utils from "../../lib/utils";
import * as actions from "../../actions";

import user from "../../lib/user";

import AvatarImage from "../AvatarImage";
import SimpleWebRTC from "../../lib/SimpleWebRTC/src/simplewebrtc";

import MicOnImage from "../../assets/img/mic-on.svg";
import MicOffImage from "../../assets/img/mic-off.svg";
import CamOnImage from "../../assets/img/cam-on.svg";
import CamOffImage from "../../assets/img/cam-off.svg";
import HangupImage from "../../assets/img/hangup.svg";
import ArrowDownImage from "../../assets/img/arrow-down.svg";
import ArrowUpImage from "../../assets/img/arrow-up.svg";

class CallingDialog extends Component {
  static propTypes = {};

  taggleWindowState = () => {
    if (this.props.windowState == constant.CallWindowStateMax)
      this.props.setWindowState(constant.CallWindowStateMin);

    if (this.props.windowState == constant.CallWindowStateMin)
      this.props.setWindowState(constant.CallWindowStateMax);
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.micOn != nextProps.micOn) {
      if (!this.webRTC) return;

      if (nextProps.micOn) this.webRTC.unmute();

      if (!nextProps.micOn) this.webRTC.mute();
    }

    if (this.props.videoOn != nextProps.videoOn) {
      if (!this.webRTC) return;

      if (nextProps.videoOn) this.webRTC.resumeVideo();

      if (!nextProps.videoOn) this.webRTC.pauseVideo();
    }

    if (this.props.calling != nextProps.calling && nextProps.calling) {
      let targetUser = null;

      if (this.props.incomingCallUser._id)
        targetUser = this.props.incomingCallUser;
      if (this.props.outgoingCallUser._id)
        targetUser = this.props.outgoingCallUser;

      this.roomId = utils.chatIdByUser(targetUser);

      var media = {
        video: false,
        audio: true
      };

      if (this.props.callingMediaType == constant.CallMediaTypeVideo) {
        media.video = {};
      }

      // init simplewebrtc
      this.webRTC = new SimpleWebRTC({
        debug: true,
        localVideoEl: "video-mine",
        remoteVideosEl: "video-target",
        url: config.SignalingServerURL + "/signaling", // socket.io name space
        autoRequestMedia: true,
        media: media,
        peerConnectionConfig: {
          iceTransports: "all"
        },
        socketio: {
          transports: ["websocket"],
          upgrade: false
        }
      });

      this.webRTC.on("readyToCall", () => {
        this.webRTC.joinRoom(this.roomId);
      });

      this.webRTC.on("leftRoom", () => {
        this.webRTC.disconnect();

        this.webRTC.off("connectionReady");
        this.webRTC.off("readyToCall");
        this.webRTC.off("createdPeer");
        this.webRTC.off("remove");
        this.webRTC.off("error");
        this.webRTC.off("localMediaError");
        this.webRTC.off("leftRoom");

        this.webRTC = null;

        document.querySelectorAll("#video-mine video").forEach(elm => {
          elm.remove();
        });

        console.log("webrtc released");
      });
    }

    if (this.props.calling != nextProps.calling && !nextProps.calling) {
      this.webRTC.stopLocalVideo();
      this.webRTC.leaveRoom();
    }
  }

  render() {
    let mainClass = "modal modal-fill calling";
    if (this.props.calling) mainClass += " show";

    if (this.props.windowState == constant.CallWindowStateMin)
      mainClass += " minimized";

    let minClass = "calling-minimized";
    if (this.props.calling) minClass += " show";

    if (this.props.windowState == constant.CallWindowStateMax)
      minClass += " minimized";

    let targetUser = this.props.incomingCallUser;
    if (!targetUser._id) targetUser = this.props.outgoingCallUser;

    let fileId = null;

    if (targetUser && targetUser.avatar && targetUser.avatar.thumbnail)
      fileId = targetUser.avatar.thumbnail.nameOnServer;

    let myFileId = "";

    if (user.userData && user.userData.avatar && user.userData.avatar.thumbnail)
      myFileId = user.userData.avatar.thumbnail.nameOnServer;

    return (
      <div>
        <div className={minClass}>
          <div className="user-holder">
            <AvatarImage fileId={fileId} type={constant.AvatarUser} />
            {targetUser.name}
          </div>

          <div className="button-holder">
            {this.props.micOn ? (
              <button
                onClick={this.props.mute}
                className="btn btn-square btn-round btn-success"
              >
                <img src={MicOnImage} />
              </button>
            ) : null}

            {!this.props.micOn ? (
              <button
                onClick={this.props.unmute}
                className="btn btn-square btn-round btn-danger"
              >
                <img src={MicOffImage} />
              </button>
            ) : null}

            {this.props.videoOn &&
              this.props.callingMediaType == constant.CallMediaTypeVideo ? (
                <button
                  onClick={this.props.stopVideo}
                  className="btn btn-square btn-round btn-success"
                >
                  <img src={CamOnImage} />
                </button>
              ) : null}

            {!this.props.videoOn &&
              this.props.callingMediaType == constant.CallMediaTypeVideo ? (
                <button
                  onClick={this.props.startVideo}
                  className="btn btn-square btn-round btn-danger"
                >
                  <img src={CamOffImage} />
                </button>
              ) : null}

            <button
              onClick={this.props.finish}
              className="btn btn-square btn-round btn-danger"
            >
              <img src={HangupImage} />
            </button>

            <button
              onClick={this.taggleWindowState}
              className="btn btn-square btn-round btn-success"
            >
              <img src={ArrowUpImage} />
            </button>
          </div>
        </div>

        <div className={mainClass}>
          <div className="row">
            <div className="offset-md-1 col-md-10 videos">
              <div className="target-video-holder">
                <div className="avatar-holder">
                  <AvatarImage fileId={fileId} type={constant.AvatarUser} />
                  <br />
                  {targetUser.name}
                </div>

                <div id="video-target" />
              </div>

              <div className="my-video-holder">
                <div className="avatar-holder">
                  <AvatarImage fileId={myFileId} type={constant.AvatarUser} />
                  <br />
                  {user.userData.name}
                </div>

                <div id="video-mine" />
              </div>

              <div className="buttons-holder">
                {this.props.micOn ? (
                  <button
                    onClick={this.props.mute}
                    className="btn btn-square btn-round btn-success"
                  >
                    <img src={MicOnImage} />
                  </button>
                ) : null}

                {!this.props.micOn ? (
                  <button
                    onClick={this.props.unmute}
                    className="btn btn-square btn-round btn-danger"
                  >
                    <img src={MicOffImage} />
                  </button>
                ) : null}

                {this.props.videoOn &&
                  this.props.callingMediaType == constant.CallMediaTypeVideo ? (
                    <button
                      onClick={this.props.stopVideo}
                      className="btn btn-square btn-round btn-success"
                    >
                      <img src={CamOnImage} />
                    </button>
                  ) : null}

                {!this.props.videoOn &&
                  this.props.callingMediaType == constant.CallMediaTypeVideo ? (
                    <button
                      onClick={this.props.startVideo}
                      className="btn btn-square btn-round btn-danger"
                    >
                      <img src={CamOffImage} />
                    </button>
                  ) : null}

                <button
                  onClick={this.props.finish}
                  className="btn btn-square btn-round btn-danger"
                >
                  <img src={HangupImage} />
                </button>

                <button
                  onClick={this.taggleWindowState}
                  className="btn btn-square btn-round btn-success"
                >
                  <img src={ArrowDownImage} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    calling: state.call.calling,
    incomingCallUser: state.call.incomingCallUser,
    outgoingCallUser: state.call.outgoingCallUser,
    callingMediaType: state.call.callingMediaType,
    micOn: state.call.micOn,
    videoOn: state.call.videoOn,
    windowState: state.call.windowState
  };
};

const mapDispatchToProps = dispatch => {
  return {
    finish: () => dispatch(actions.call.callFinish()),
    mute: () => dispatch(actions.call.callMute()),
    unmute: () => dispatch(actions.call.callUnMute()),
    startVideo: () => dispatch(actions.call.callStartVideo()),
    stopVideo: () => dispatch(actions.call.callStopVideo()),
    setWindowState: state => dispatch(actions.call.setWindowState(state))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CallingDialog);
