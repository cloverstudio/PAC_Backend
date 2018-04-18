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

    setImgLoading = (val = false) => {
        this.setState({
            isLoading : val
        })
    }
    
    render() {
        
        return(
            <div className={this.props.visibility ? 'imageView imageView-opened': 'imageView'}
            onClick={ e => e.target.nodeName==='DIV' ? this.props.hideImageView() : false }>
            
                    {this.props.visibility 
                        ? <img className={this.state.isLoading ? 'imageView-img': 'imageView-img loaded'} 
                        src={config.APIEndpoint + constant.ApiUrlFile + this.props.imgId}
                        alt="image" onLoad={e=> this.setImgLoading()}/> 
                        : null}

                    {this.state.isLoading 
                        ? <div className="spinner-dots">
                            <span className="dot1"></span>
                            <span className="dot2"></span>
                            <span className="dot3"></span>
                        </div>
                        : null}
                    
                    <span className="imageView-close" 
                        onClick={e => {
                            this.props.hideImageView(); 
                            this.setImgLoading(true)
                            }}><i className="ti-close"></i></span>
            </div>
        )
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
