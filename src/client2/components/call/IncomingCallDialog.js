import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';

import spikaLogin from '../../assets/img/spikaLogin.png';
import loginPic from '../../assets/img/loginPic.jpg';

import AvatarImage from '../AvatarImage';

class Calling extends Component {

    static propTypes = {
    }

    render() {
        
        const mainStyle = {
            display: 'none'
        }

        if(this.props.showIncomingCall)
            mainStyle.display = 'block';

        let fileId = null;
        
        if(this.props.user && this.props.user.avatar && this.props.user.avatar.thumbnail)
            fileId = this.props.user.avatar.thumbnail.nameOnServer;
            
        return (

            <div className="modal-open">
            
                <div className="modal modal-center fade show" id="modal-center" tabindex="-1" style={mainStyle}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">

                                <div className="media media-single">
                                    <AvatarImage fileId={fileId} type={constant.AvatarUser} />
                                    <span className="title"><strong>{this.props.user.name}</strong> is calling.</span>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-w-md btn-danger" onClick={this.props.reject} >Reject</button>
                                    <button className="btn btn-w-md btn-primary">Accept</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {this.props.showIncomingCall ? <div className="modal-backdrop fade show"></div>:null }

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        showIncomingCall: state.call.incomingcallRinging,
        user: state.call.incomingcallUser
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        reject: tabName => dispatch(actions.call.incomingCallReject()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Calling);
