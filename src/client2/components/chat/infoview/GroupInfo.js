import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as constant from '../../../lib/const';
import * as actions from '../../../actions';

import AvatarImage from '../../AvatarImage';

class GroupInfo extends Component {

    static propTypes = {
    }

    tabChange = (tabName) => {
        this.props.tabChange(tabName);
    }

    render() {

        let cnTabGeneral = "nav-link ";
        let cnTabDetail = "nav-link ";

        let cnTabContentGeneral = "tab-pane fade show ";
        let cnTabContentDetail = "tab-pane fade show ";

        if(this.props.tabState == 'general'){
            cnTabGeneral += " active";
            cnTabContentGeneral += " active";
        }


        if(this.props.tabState == 'detail'){
            cnTabDetail += " active";
            cnTabContentDetail += " active";
        }


        return (
            <div> 

                <ul className="quickview-header nav nav-tabs nav-justified nav-tabs-info">
                    <li className="nav-item" onClick={ () => {this.tabChange("general")}}>
                        <a className={cnTabGeneral}>General</a>
                    </li>
                    <li className="nav-item" onClick={ () => {this.tabChange("detail")}}>
                        <a className={cnTabDetail}>Detail</a>
                    </li>
                </ul>
                
                <div className="tab-content">
                    
                    <div className={cnTabContentGeneral}>
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

                        <div className="media-list media-list-hover">
                            <div className="media items-center">
                                <img className="avatar avatar-sm" src="../assets/img/avatar/1.jpg" alt="..." />
                                <p className="title">Maryam Amiri</p>
                                <a className="media-action hover-primary" href="#"><i className="fa fa-phone"></i></a>
                                <a className="media-action hover-primary" href="#"><i className="fa fa-envelope"></i></a>
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
        tabState: state.chatUI.groupInfoTabState
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        tabChange: tabName => dispatch(actions.chatUI.tabChangedGroupInfo(tabName))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GroupInfo);
