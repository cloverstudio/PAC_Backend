import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import * as constant from "../../lib/const";
import * as actions from "../../actions";
import * as util from "../../lib/utils";
import Encryption from "../../lib/encryption/encryption";

class MessageUpdate extends Component {
    static propTypes = {};

    constructor() {
        super();
        
        this.state = {
            textAreaValue : ''
        }
    }

    handleChange = value => {
        this.setState({
            textAreaValue : value
        })
    }

    componentWillReceiveProps(nextProps){
        
        if (typeof nextProps.oldMessageValue !== 'undefined' 
        && nextProps.oldMessageValue.length > 0 
        && nextProps.oldMessageValue !== this.props.oldMessageValue){

            const oldMsg = Encryption.decryptText(nextProps.oldMessageValue);
            
            this.setState({
                textAreaValue: oldMsg
            });

        }
    }

    componentDidUpdate(prevProps){
        if(!prevProps.visibility) this.textArea.select();
    }
    
    render() {
        
        const mainStyle = {
            display: "none"
        };


        if (this.props.visibility) mainStyle.display = "block";

        return (
            <div className="modal-open">
                <div
                    className="modal modal-center fade show"
                    id="modal-center"
                    tabIndex="-1"
                    style={mainStyle}
                >
                    <div className="modal-dialog messageUpdate">
                        <div className="modal-content">
                            <div className="modal-header">

                                <h5 className="modal-title">Edit message</h5>

                                <button type="button" className="close msgInfo-dialog-close" onClick={e=> this.props.hideMessageUpdateView()}>
                                    <span className="msgInfo-dialog-close" aria-hidden="true">×</span>
                                </button>

                            </div>
                            
                            <div className="modal-body">
                                <textarea
                                onChange={e=> this.handleChange(e.target.value)}
                                ref={textArea => this.textArea = textArea} 
                                className="form-control msg-update" 
                                rows="6"
                                value={this.state.textAreaValue}
                                ></textarea>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-w-md btn-primary" onClick={e => {
                                    if (this.textArea.value.length > 0){
                                        this.props.sendUpdateMessage(this.textArea.value);
                                        this.textArea.value = "";
                                        this.props.hideMessageUpdateView();
                                    }
                                }}>Edit</button>
                            </div>
                        </div>
                    </div>
                </div>

                {this.props.visibility 
                    ? <div className="modal-backdrop fade show" />
                    : null}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        visibility: state.chatUI.messageUpdateViewState,
        oldMessageValue: state.messageInfo.selectedMessage.message
    };
};

const mapDispatchToProps = dispatch => {
    return {
        hideMessageUpdateView: () => dispatch(actions.chatUI.hideMessageUpdateView()),
        sendUpdateMessage: (content) => dispatch(actions.chat.sendUpdateMessage(content))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MessageUpdate);
