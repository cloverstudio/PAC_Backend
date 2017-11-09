import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as actions from '../../../actions';

import AvatarImage from '../../AvatarImage';
import DateTime from '../../DateTime';

class UserInfo extends Component {

    static propTypes = {
    }

    tabChange = (tabName) => {
        this.props.tabChange(tabName);
    }

    render() {

        let cnTabGeneral = "nav-link ";
        let cnTabDetail = "nav-link ";

        let cnTabContentGeneral = "tab-pane fade show  mt-12 pr-12";
        let cnTabContentDetail = "tab-pane fade show bg-white";

        if(this.props.tabState == 'general'){
            cnTabGeneral += " active";
            cnTabContentGeneral += " active";
        }


        if(this.props.tabState == 'detail'){
            cnTabDetail += " active";
            cnTabContentDetail += " active";
        }

        // get last login
        let lastlogin = 0;

        if(this.props.user){
            const lastToken = this.props.user.token[this.props.user.token.length - 1];
            if(lastToken)
                lastlogin = lastToken.generateAt;
        }

        return (
            
            <div> 
                
                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info">
                    <li className="nav-item" onClick={ () => {this.tabChange("general")}}  >
                        <a className={cnTabGeneral}>General</a>
                    </li>
                    <li className="nav-item" onClick={ () => {this.tabChange("detail")}}   >
                        <a className={cnTabDetail}>Detail</a>
                    </li>
                </ul>
                
                <div className="tab-content">
                    
                    <div className={cnTabContentGeneral}>

                        <div className="media">
                            <div className="media-body">
                            </div>
                            <button className="btn btn-w-md btn-multiline btn-primary"><i className="ti-video-camera fs-30"></i><br />Video Call</button>
                            <button className="btn btn-w-md btn-multiline btn-info"><i className="ti-headphone-alt fs-30"></i><br />Voice Call</button>
                        </div>

                        <div className="media">
                            <div className="media-body">
                                <p><strong>Notification</strong></p>
                                <p>This room is muted.</p>
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                        
                        <div className="media">
                            <div className="media-body">
                                <p><strong>Block</strong></p>
                                <p>This user is not blocked.</p>
                            </div>
                            <label className="switch switch-lg">
                                <input type="checkbox" />
                                <span className="switch-indicator"></span>
                            </label>
                        </div>

                    </div>

                    <div className={cnTabContentDetail}>

                        <div className="quickview-block form-type-material">
                            <div className="form-group do-float">
                                <span className="form-control">{this.props.user.name}</span>
                                <label>Name</label>
                            </div>
                
                            <div className="form-group do-float">
                                <span className="form-control">{this.props.user.description}</span>
                                <label>Description</label>
                            </div>

                            <div className="form-group do-float">
                                <span className="form-control">
                                    <DateTime timestamp={lastlogin} />
                                </span>
                                <label>Last Login</label>
                            </div>


                        </div>

                    </div>

                </div>

            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        tabState: state.chatUI.userInfoTabState,
        user: state.infoview.user

    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        tabChange: tabName => dispatch(actions.chatUI.tabChangedUserInfo(tabName))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserInfo);
