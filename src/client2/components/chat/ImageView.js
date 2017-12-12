import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../lib/const';
import * as actions from '../../actions';


class ImageView extends Component {

    static propTypes = {
    }

    render() {
        // return (
            
        //     // <div className={}> 

        //     // </div>

        // );
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageView);
