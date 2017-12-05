import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as actions from '../actions';

import * as utils from '../lib/utils';

import spikaLogin from '../assets/img/spikaLogin.png';
import loginPic from '../assets/img/loginPic.jpg';

class ReLogin extends Component {

    static propTypes = {
    }

    componentWillMount() {


    }
    
    render() {
        
        return (
             <Redirect to={`${utils.url('/')}`} />
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
)(ReLogin);
