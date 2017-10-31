import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import spikaSignUp from '../assets/img/spikaSignUp.png';
import signupPic from '../assets/img/signupPic.jpg';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';

class Main extends Component {

    static propTypes = {
    }

    render() {
        
        return (
            <div>main</div>
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
)(Main);
