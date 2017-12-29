import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';

import spikaLogin from '../../assets/img/spikaLogin.png';
import loginPic from '../../assets/img/loginPic.jpg';

import AvatarImage from '../AvatarImage';

class OutgoingCallDialog extends Component {

    static propTypes = {
    }

    render() {
        
        const mainStyle = {
            display: 'none'
        }

        if(this.props.showOutgoingCall)
            mainStyle.display = 'block';

        let fileId = null;
        
        if(this.props.user && this.props.user.avatar && this.props.user.avatar.thumbnail)
            fileId = this.props.user.avatar.thumbnail.nameOnServer;
            
        return (

            <div className="modal-open">
            
                <div className="modal modal-center fade show" id="modal-center" tabIndex="-1" style={mainStyle}>
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">
                                    <AvatarImage fileId={fileId} type={constant.AvatarUser} /> Calling <strong>{this.props.user.name}</strong>
                                </h4>
                            </div>

                            <div className="modal-body">

                                {this.props.statusMessage}

                                <div className="modal-footer">
                                    <button className="btn btn-w-md btn-danger" onClick={this.props.stopCalling} >Stop Calling</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {this.props.showOutgoingCall ? <div className="modal-backdrop fade show"></div>:null }

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        showOutgoingCall: state.call.outgoingCallRinging,
        user: state.call.outgoingCallUser,
        statusMessage: state.call.outgoingStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        stopCalling: tabName => dispatch(actions.call.outgoingCallClose()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OutgoingCallDialog);
