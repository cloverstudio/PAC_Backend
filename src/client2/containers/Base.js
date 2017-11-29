import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as util from '../lib/utils';

class Base extends Component {

    globalClick = (e) => {
        
        if(/input/i.test(e.target.tagName)){
            return;
        }

        if(! /topbar-btn|bell/.test(e.target.className))
            this.props.hideNotifications();

        if(! /topbar-btn|fa-user/.test(e.target.className))
            this.props.hideUsersView();
        
        if(! /topbar-btn|fa-users/.test(e.target.className))
            this.props.hideGroupsView();

        if(! /topbar-btn|sidebar-icon/.test(e.target.className))
            this.props.hideSidebar();
    
        if(! /sidebar|history|menu-link/.test(e.target.className))
            this.props.hideHistory();

        console.log("classname",e.target.className);
    }

    
}


export default Base;
