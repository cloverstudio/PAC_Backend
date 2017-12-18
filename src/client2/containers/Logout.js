import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Toast from '../components/Toast';
import * as actions from '../actions';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import * as utils from '../lib/utils';
import user from '../lib/user';

class Logout extends Component {

    static propTypes = {
    }

    componentWillMount() {

        user.logout();
        
        this.props.onLogout();

    }

    render() {

        return <Redirect to={`${utils.url('/')}`} />
    
    }

}

const mapStateToProps = (state) => {
    return {
        loadingLogin: state.login.loadingLogin,
        organization: state.login.organization,
        username: state.login.username,
        password: state.login.password,
        remember: state.login.remember
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLogout: (v) => dispatch(actions.logout.onLogout()),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Logout);
