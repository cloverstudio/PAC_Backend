import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';

import spikaLogoPic from '../../assets/img/logoLight.png';

class History extends Component {

    static propTypes = {
    }

	componentDidMount() {
        
        this.props.loadHistoryInitial();
        
	}

    render() {

        return (
            
            <aside className="aside aside-lg aside-expand-lg">

                {this.props.historyLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div> : null
                }

                <div className="aside-body pt-0">

                    <div className="media-list media-list-divided media-list-hover">

                        <header className="media-list-header b-0">
                            <form className="lookup lookup-lg w-100 bb-1 border-light">
                                <input className="w-100 no-radius no-border py-30" type="text" placeholder="Search..." />
                            </form>
                        </header>

                        <div className="media-list-body">
                        <a className="media align-items-center active" href="#">
                            <span className="avatar status-success">
                            <img src="../assets/img/avatar/1.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                                <div className="flexbox align-items-center">
                                    <strong className="title">Maryam Amiri</strong>
                                    <time dateTime="2017-07-14 20:00">12:11</time>
                                    <span className="badge badge-pill badge-primary">3</span>
                                </div>
                                <p className="text-truncate">You need to update the changelog in documentation before we release the current version.</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-warning">
                            <img src="../assets/img/avatar/2.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Patric Johnson</strong>
                                <time dateTime="2017-07-14 20:00">09:34</time>
                                <span className="badge badge-pill badge-primary">1</span>
                            </div>
                            <p className="text-truncate">Ok, I'll take care of it</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-danger">
                            <img src="../assets/img/avatar/3.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Sarah Conner</strong>
                                <time dateTime="2017-07-14 20:00">04:29</time>
                            </div>
                            <p className="text-truncate">Good Morning!</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-warning">
                            <img src="../assets/img/avatar/default.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Teisha Hummel</strong>
                                <time dateTime="2017-07-14 20:00">Yesterday</time>
                            </div>
                            <p className="text-truncate">Bye</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-success">
                            <img src="../assets/img/avatar/5.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Bobby Mincy</strong>
                                <time dateTime="2017-07-14 20:00">Yesterday</time>
                            </div>
                            <p className="text-truncate">See you then</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-danger">
                            <img src="../assets/img/avatar/6.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Tim Hank</strong>
                                <time dateTime="2017-07-14 20:00">2 days ago</time>
                            </div>
                            <p className="text-truncate">Continually grow corporate solutions rather than ethical.</p>
                            </div>
                        </a>

                        <a className="media align-items-center" href="#">
                            <span className="avatar status-success">
                            <img src="../assets/img/avatar/8.jpg" alt="..." />
                            </span>
                            <div className="media-body">
                            <div className="flexbox align-items-center">
                                <strong className="title">Fidel Tonn</strong>
                                <time dateTime="2017-07-14 20:00">2 days ago</time>
                            </div>
                            <p className="text-truncate">Foster resource maximizing niches before high standards.</p>
                            </div>
                        </a>
                        </div>

                    </div>
                </div>

                <button className="aside-toggler"></button>

            </aside>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        historyLoading: state.history.historyLoading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        
        loadHistoryInitial: () => dispatch(actions.history.loadHistoryInitial())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(History);
