import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';

import * as constant from '../lib/const';
import * as config from '../lib/config';

class DateTime extends Component {

    static propTypes = {
    }

    formatDate(ut){
        
        var date = new Date(ut);
        // hours part from the timestamp
        var hours = date.getHours();
        // minutes part from the timestamp
        var minutes = date.getMinutes();
        // seconds part from the timestamp
        var seconds = date.getSeconds();
        
        // will display time in 10:30:23 format
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getYear();
        
        // dont want include browser detaction library so use this dumb style.
        if(year < 1000){
            year += 1900;
        }
        
        if(hours < 10)
            hours = '0' + hours;
            
        if(minutes < 10)
            minutes = '0' + minutes;
            
        if(seconds < 10)
            seconds = '0' + seconds;
        
        
        if(month < 10)
            month = '0' + month;
        
        if(day < 10)
            day = '0' + day;
        
        var formattedTime = year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        
        var nowDate = new Date();
        var now = new Date().getTime();
        var interval = (now - ut) / 1000;
        
        if(interval < 60){
            return 'now';
        }
        else if(interval < 60*60){
            return  Math.floor(interval / 60) + " min ago";
        }
        else if(interval < 60*60*24){
            return  Math.floor(interval / 60 / 60) + " hours ago";
        }
        else if(nowDate.getDate() == date.getDate() && nowDate.getMonth() == date.getMonth() && nowDate.getYear() == date.getYear()){
            return  hours + ':' + minutes + ':' + seconds;
        }
        else{
            formattedTime;
        }
        
        
        return formattedTime;
    }

    render() {
        
        const formetedTime = this.formatDate(this.props.timestamp);

        return (
            <time dateTime={this.props.timestamp}>
                {formetedTime}
            </time>
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
)(DateTime);
