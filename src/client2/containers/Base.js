import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import * as actions from "../actions";

import * as constant from "../lib/const";
import * as strings from "../lib/strings";
import * as util from "../lib/utils";

class Base extends Component {
  globalClick = e => {
    if (/input/i.test(e.target.tagName)) {
      return;
    }

    if (!/topbar-btn|bell/.test(e.target.className))
      this.props.hideNotifications();

    if (!/topbar-btn|fa-user/.test(e.target.className))
      this.props.hideUsersView();

    if (!/topbar-btn|fa-users/.test(e.target.className))
      this.props.hideGroupsView();

    if (!/topbar-btn|sidebar-icon/.test(e.target.className))
      this.props.hideSidebar();

    if (!/sidebar|history|menu-link/.test(e.target.className))
      this.props.hideHistory();

    if (
      !/publisher-btn|fa-smile-o|nav-link|stickers-nav/.test(e.target.className)
    )
      this.props.hideStickersView();

    if (!/^.*-message|btn-multiline|msg-target|msg-update|msgInfo-dialog-close/.test(e.target.className)) {
      if (this.props.hideMessageInfoView) this.props.hideMessageInfoView();
    }
  };
}

export default Base;
