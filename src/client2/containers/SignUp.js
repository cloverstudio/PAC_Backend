import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import spikaSignUp from '../assets/img/spikaSignUp.png';
import signupPic from '../assets/img/signupPic.jpg';

import * as constnat from '../lib/const';
import * as strings from '../lib/strings';
import user from '../lib/user';

class SignUp extends Component {

    static propTypes = {
    }
    
    render() {
        
        return (
            <div className="row no-gutters min-h-fullscreen bg-white">
                <div className="col-md-6 col-lg-7 col-xl-8 d-none d-md-block bg-img" style={{backgroundImage: `url(${signupPic})`}} data-overlay="5">

                <div className="row h-100 pl-50">
                    <div className="col-md-10 col-lg-8 align-self-end">
                    <img src={spikaSignUp} alt="..." />
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
                        <h4>{strings.SignupTitle1[user.lang]} <strong>Clover</strong></h4>
                        <p><small></small></p>
                        <br />

                        <form className="form-type-material">

                        <div className="form-group">
                            <input type="text" className="form-control" id="username" placeholder={strings.SignupFormPlaceholderUsername[user.lang]}/>
                        </div>

                        <div className="form-group">
                            <input type="password" className="form-control" id="password" placeholder={strings.SignupFormPlaceholderPassword[user.lang]}/>
                        </div>

                        <div className="form-group">
                            <input type="password" className="form-control" id="password" placeholder={strings.SignupFormPlaceholderRePassword[user.lang]}/>
                        </div>


                        <div className="form-group">
                            <button className="btn btn-bold btn-block btn-primary" type="submit">{strings.SignUpButtonTitle[user.lang]}</button>
                        </div>
                        </form>

                        <hr className="w-30px" />

                        <p className="text-center text-muted fs-13 mt-20">{strings.SignUpBackText[user.lang]}<br />
                            &nbsp;<Link to={'/'} className="text-primary fw-500">{strings.SignUpLoginLink[user.lang]}</Link>
                        </p>
                    </div>
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
)(SignUp);
