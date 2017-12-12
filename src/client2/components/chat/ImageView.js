import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';
import * as config from '../../lib/config';

class ImageView extends Component {

    constructor(){
        super();
        this.state = {
            isLoading: true
        }
    }
    static propTypes = {
    }

    toggleImgLoading = () => {
        this.setState({
            isLoading : !this.state.isLoading
        })
    }

    render() {
        const mainStyle = {
            display: this.props.visibility ? 'block' : 'none'
        }
        return(
        <div className="modal-open">
            <div className="modal modal-center fade show image-view" id="modal-center" style={mainStyle}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" 
                        onClick={e => {
                            this.props.hideImageView(); 
                            this.toggleImgLoading()
                            }}>
                            <span aria-hidden="true">×</span>
                        </button>
                        </div>
                        <div className="modal-body">
                            {this.state.isLoading ?
                            <span className="spinner-linear">
                                <span className="line"></span>
                            </span> : null}
                            {this.props.visibility ? 
                            <img src={config.APIEndpoint + constant.ApiUrlFile + this.props.imgId}
                            alt="image"
                            onLoad={e=> this.toggleImgLoading()}/> : null}
                        </div>
                
                    </div>
                </div>
            </div>
            {this.props.visibility ? <div className="modal-backdrop fade show"></div>:null } 
        </div> )
    }

}


{/* <div className="modal-open">

    <div className="modal modal-center fade show" id="modal-center" tabindex="-1" style={mainStyle}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-body">

                    <div className="media media-single">
                        <AvatarImage fileId={fileId} type={constant.AvatarUser} />
                        <span className="title">
                            <strong>{this.props.user.name}</strong> is calling. <br />
                            {!this.props.mediaReady ?
                                <div> {this.props.incomingStatus} </div> : null
                            }
                        </span>
                    </div>



                    {this.props.mediaReady ?
                        <div className="modal-footer">
                            <button className="btn btn-w-md btn-danger" onClick={this.props.reject} >Reject</button>
                            <button className="btn btn-w-md btn-primary" onClick={this.props.accept} >Accept</button>
                        </div> : null
                    }

                </div>
            </div>
        </div>
    </div>

    {this.props.showIncomingCall && !this.props.calling ? <div className="modal-backdrop fade show"></div>:null }

</div> */}

{/* <div class="modal modal-center fade show" id="modal-center" tabindex="-1" style="display: block; padding-right: 15px;">
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">Modal title</h5>
                            <button type="button" class="close" data-dismiss="modal">
                              <span aria-hidden="true">×</span>
                            </button>
                          </div>
                          <div class="modal-body">
                            <p>Your content comes here</p>
                            <br><br><br><br><br><br>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-bold btn-pure btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-bold btn-pure btn-primary">Save changes</button>
                          </div>
                        </div>
                      </div>
                    </div> */}

const mapStateToProps = (state) => {
    return {
        visibility: state.chatUI.imageViewState,
        imgId: state.imageView.imgId
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        hideImageView: () => dispatch(actions.chatUI.hideImageView())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageView);
