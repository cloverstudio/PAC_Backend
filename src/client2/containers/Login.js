import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Toast from '../components/Toast';
import * as actions from '../actions';

import spikaLogin from '../assets/img/spikaLogin.png';
import loginPic from '../assets/img/loginPic.jpg';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';

class Login extends Component {

    static propTypes = {
    }

    handleLoginClick = (e) => {
        e.preventDefault();

        this.props.onLoginClick(
            this.props.organization,
            this.props.username,
            this.props.password
        );
    }

    handleOrg = (v) => {
        this.props.onOrgChange(v);
    }

    handleUserName = (v) => {
        this.props.onUserNameChange(v);
    }

    handlePassword = (v) =>{
        this.props.onPasswordChange(v);
    }

    handleRememberCheck = (v) => {
        this.props.onRememberCheck(v);
    }

    render() {
        
        console.log(strings.EnterTitle1);
        console.log(user.lang);

        return (
            <div className="row no-gutters min-h-fullscreen bg-white">

                <div className="col-md-6 col-lg-7 col-xl-8 d-none d-md-block bg-img" style={{backgroundImage: `url(${loginPic})`}} data-overlay="5">

                    <div className="row h-100 pl-50">
                        <div className="col-md-10 col-lg-8 align-self-end">
                            <img src={spikaLogin} alt="..." />
                            <br /><br /><br />
                            <h4 className="text-white">{strings.EnterTitle1[user.lang]}</h4>
                            <p className="text-white">
                                {strings.EnterText1[user.lang]}
                            </p>
                            <br /><br />
                        </div>
                    </div>

                    </div>

                    <div className="col-md-6 col-lg-5 col-xl-4 align-self-center">
                    <div className="px-80 py-30">
                    <h4>{strings.LoginTitle1[user.lang]}</h4>
                    <p><small>{strings.LoginText2[user.lang]}</small></p>
                    <br />

                    <form className="form-type-material" onSubmit={this.handleLoginClick}>

                        <div className="form-group">
                            <input type="text" className="form-control" placeholder={strings.LoginFormPlaceholderOrganization[user.lang]} 
                                value={this.props.organization}
                                onChange={e => this.handleOrg(e.target.value)} />
                        </div>
                            
                        <div className="form-group">
                            <input type="text" className="form-control" placeholder={strings.LoginFormPlaceholderUsername[user.lang]} 
                                value={this.props.username}
                                onChange={e => this.handleUserName(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <input type="password" className="form-control" placeholder={strings.LoginFormPlaceholderPassword[user.lang]} 
                                value={this.props.password}
                                onChange={e => this.handlePassword(e.target.value)} />
                        </div>

                        <div className="form-group flexbox">
                            <label className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" 
                                checked={this.props.remember}
                                onChange={e => this.handleRememberCheck(e.target.checked)}/>
                            <span className="custom-control-indicator"></span>
                            <span className="custom-control-description">{strings.LoginFormRemember[user.lang]}</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <button className="btn btn-bold btn-block btn-primary" type="submit">
                                {this.props.loadingLogin ? <i className="fa fa-spinner fa-spin fa-fw"></i>:null }
                                {strings.LoginButtonTitle[user.lang]}
                            </button>
                        </div>
                        
                    </form>

                    <hr className="w-30px" />

                    <p className="text-center text-muted fs-13 mt-20">{strings.LoginText3[user.lang]}<br />
                         &nbsp; <Link to={'/signup'} className="text-primary fw-500">{strings.LoginLink1[user.lang]}</Link>
                    </p>
                    </div>
                </div>

                <Toast />
            </div>
        );
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
        onLoginClick: (org,username,password) => dispatch(actions.login.onLoginClick(org,username,password)),
        onOrgChange: (v) => dispatch(actions.login.onOrgChange(v)),
        onUserNameChange: (v) => dispatch(actions.login.onUserNameChange(v)),
        onPasswordChange: (v) => dispatch(actions.login.onPasswordChange(v)),
        onRememberCheck: (v) => dispatch(actions.login.onRememberCheck(v)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
