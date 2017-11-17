import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';

class Stickers extends Component {

    static propTypes = {
    }

    render() {

        return (
            
            <div className="dropdown-menu dropdown-grid" x-placement="bottom-start">

                {this.props.stickersLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div> : null
                }

            </div>

        );
    }

}

// <div class="dropdown-menu dropdown-grid" x-placement="bottom-start" style="position: absolute; top: 36px; left: 0px; will-change: top, left;">
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="compact_camera" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#607D8B" d="M40,39H8c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h32c2.2,0,4,1.8,4,4v22C44,37.2,42.2,39,40,39z"></path><circle fill="#455A64" cx="29" cy="24" r="12"></circle><circle fill="#42A5F5" cx="29" cy="24" r="9"></circle><path fill="#90CAF9" d="M33.8,21c-1.2-1.4-3-2.2-4.8-2.2s-3.6,0.8-4.8,2.2c-0.5,0.5-0.4,1.3,0.1,1.8c0.5,0.5,1.3,0.4,1.8-0.1 c1.5-1.7,4.3-1.7,5.8,0c0.3,0.3,0.6,0.4,1,0.4c0.3,0,0.6-0.1,0.9-0.3C34.2,22.4,34.3,21.5,33.8,21z"></path><rect x="8" y="13" fill="#ADD8FB" width="6" height="3"></rect></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="stack_of_photos" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><rect x="12.3" y="12.3" transform="matrix(.948 .318 -.318 .948 9.725 -6.994)" fill="#64B5F6" width="28" height="28"></rect><rect x="15.6" y="15.4" transform="matrix(.951 .31 -.31 .951 9.176 -6.977)" fill="#1E88E5" width="22" height="20"></rect><rect x="8.1" y="8.1" transform="matrix(.983 .181 -.181 .983 4.385 -3.65)" fill="#90CAF9" width="28" height="28"></rect><rect x="11.3" y="11.2" transform="matrix(.985 .175 -.175 .985 4.048 -3.566)" fill="#42A5F5" width="22" height="20"></rect><rect x="4" y="4" fill="#BBDEFB" width="28" height="28"></rect><rect x="7" y="7" fill="#4CAF50" width="22" height="20"></rect><path fill="#fff" d="M16,13c0-1.1,0.9-2,2-2s2,0.9,2,2s-2,4-2,4S16,14.1,16,13z"></path><path fill="#fff" d="M20,21c0,1.1-0.9,2-2,2s-2-0.9-2-2s2-4,2-4S20,19.9,20,21z"></path><path fill="#fff" d="M13.5,16.7c-1-0.6-1.3-1.8-0.7-2.7c0.6-1,1.8-1.3,2.7-0.7c1,0.6,2.5,3.7,2.5,3.7S14.5,17.3,13.5,16.7z"></path><path fill="#fff" d="M22.5,17.3c1,0.6,1.3,1.8,0.7,2.7c-0.6,1-1.8,1.3-2.7,0.7C19.5,20.2,18,17,18,17S21.5,16.7,22.5,17.3z"></path><path fill="#fff" d="M22.5,16.7c1-0.6,1.3-1.8,0.7-2.7c-0.6-1-1.8-1.3-2.7-0.7C19.5,13.8,18,17,18,17S21.5,17.3,22.5,16.7z"></path><path fill="#fff" d="M13.5,17.3c-1,0.6-1.3,1.8-0.7,2.7c0.6,1,1.8,1.3,2.7,0.7c1-0.6,2.5-3.7,2.5-3.7S14.5,16.7,13.5,17.3z"></path><circle fill="#FFC107" cx="18" cy="17" r="2"></circle></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="folder" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z"></path><path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z"></path></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="start" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#F44336" d="M38,42H10c-2.2,0-4-1.8-4-4V10c0-2.2,1.8-4,4-4h28c2.2,0,4,1.8,4,4v28C42,40.2,40.2,42,38,42z"></path><polygon fill="#fff" points="31,24 20,16 20,32"></polygon></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="music" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><g fill="#E91E63"><circle cx="19" cy="33" r="9"></circle><polygon points="24,6 24,33 28,33 28,14 39,17 39,10"></polygon></g></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="news" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#FF5722" d="M32,15v28H10c-2.2,0-4-1.8-4-4V15H32z"></path><path fill="#FFCCBC" d="M14,5v34c0,2.2-1.8,4-4,4h29c2.2,0,4-1.8,4-4V5H14z"></path><g fill="#FF5722"><rect x="20" y="10" width="18" height="4"></rect><rect x="20" y="17" width="8" height="2"></rect><rect x="30" y="17" width="8" height="2"></rect><rect x="20" y="21" width="8" height="2"></rect><rect x="30" y="21" width="8" height="2"></rect><rect x="20" y="25" width="8" height="2"></rect><rect x="30" y="25" width="8" height="2"></rect><rect x="20" y="29" width="8" height="2"></rect><rect x="30" y="29" width="8" height="2"></rect><rect x="20" y="33" width="8" height="2"></rect><rect x="30" y="33" width="8" height="2"></rect><rect x="20" y="37" width="8" height="2"></rect><rect x="30" y="37" width="8" height="2"></rect></g></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="contacts" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#FF7043" d="M38,44H12V4h26c2.2,0,4,1.8,4,4v32C42,42.2,40.2,44,38,44z"></path><path fill="#BF360C" d="M10,4h2v40h-2c-2.2,0-4-1.8-4-4V8C6,5.8,7.8,4,10,4z"></path><g fill="#AB300B"><circle cx="26" cy="20" r="4"></circle><path d="M33,30c0,0-1.9-4-7-4c-5.1,0-7,4-7,4v2h14V30z"></path></g></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="download" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><g fill="#1565C0"><polygon points="24,37.1 13,24 35,24"></polygon><rect x="20" y="4" width="8" height="4"></rect><rect x="20" y="10" width="8" height="4"></rect><rect x="20" y="16" width="8" height="11"></rect><rect x="6" y="40" width="36" height="4"></rect></g></svg></span>
//                     </a>
//                     <a class="dropdown-item" href="#">
//                       <span data-i8-icon="settings" aria-hidden="true" class="i8-icon i8-svg-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" version="1.0" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block;"><path fill="#607D8B" d="M39.6,27.2c0.1-0.7,0.2-1.4,0.2-2.2s-0.1-1.5-0.2-2.2l4.5-3.2c0.4-0.3,0.6-0.9,0.3-1.4L40,10.8 c-0.3-0.5-0.8-0.7-1.3-0.4l-5,2.3c-1.2-0.9-2.4-1.6-3.8-2.2l-0.5-5.5c-0.1-0.5-0.5-0.9-1-0.9h-8.6c-0.5,0-1,0.4-1,0.9l-0.5,5.5 c-1.4,0.6-2.7,1.3-3.8,2.2l-5-2.3c-0.5-0.2-1.1,0-1.3,0.4l-4.3,7.4c-0.3,0.5-0.1,1.1,0.3,1.4l4.5,3.2c-0.1,0.7-0.2,1.4-0.2,2.2 s0.1,1.5,0.2,2.2L4,30.4c-0.4,0.3-0.6,0.9-0.3,1.4L8,39.2c0.3,0.5,0.8,0.7,1.3,0.4l5-2.3c1.2,0.9,2.4,1.6,3.8,2.2l0.5,5.5 c0.1,0.5,0.5,0.9,1,0.9h8.6c0.5,0,1-0.4,1-0.9l0.5-5.5c1.4-0.6,2.7-1.3,3.8-2.2l5,2.3c0.5,0.2,1.1,0,1.3-0.4l4.3-7.4 c0.3-0.5,0.1-1.1-0.3-1.4L39.6,27.2z M24,35c-5.5,0-10-4.5-10-10c0-5.5,4.5-10,10-10c5.5,0,10,4.5,10,10C34,30.5,29.5,35,24,35z"></path><path fill="#455A64" d="M24,13c-6.6,0-12,5.4-12,12c0,6.6,5.4,12,12,12s12-5.4,12-12C36,18.4,30.6,13,24,13z M24,30 c-2.8,0-5-2.2-5-5c0-2.8,2.2-5,5-5s5,2.2,5,5C29,27.8,26.8,30,24,30z"></path></svg></span>
//                     </a>
//                   </div>

const mapStateToProps = (state) => {
    return {
        stickersLoading: state.stickers.loading
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Stickers);
