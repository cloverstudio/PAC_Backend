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
