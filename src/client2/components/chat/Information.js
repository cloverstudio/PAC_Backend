import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';

import spikaLogoPic from '../../assets/img/logoLight.png';

class Information extends Component {

    static propTypes = {
    }

    render() {

        return (
            
            <div className="info-container bg-lighter border-light">

                <div className="spinner-linear">
                    <div className="line"></div>
                </div>
                
                <div className="p-12">
                    Info box dd
                </div>
                
            </div>

        );
    }

}

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
)(Information);
