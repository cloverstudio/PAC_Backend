import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';

import * as constant from '../lib/const';
import * as config from '../lib/config';

import Toast from './Toast';
import IncomingCallDialog from './call/IncomingCallDialog';

class Modals extends Component {

    static propTypes = {
    }

    render() {
        
        return (
            <div>
                <Toast />
                <IncomingCallDialog />
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
)(Modals);
