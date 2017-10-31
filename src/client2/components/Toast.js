import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';

import spikaLogin from '../assets/img/spikaLogin.png';
import loginPic from '../assets/img/loginPic.jpg';

class Toast extends Component {

    static propTypes = {
    }

    render() {
        
        let mainClass = "toast";

        if(this.props.showing)
            mainClass += " reveal";

        return (
            <div className={mainClass}>
                <div className="text">{this.props.message}</div>
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        showing:state.toast.showing,
        message:state.toast.message,
        callBack:state.toast.callback
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Toast);
