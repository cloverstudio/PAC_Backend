import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';
import * as util from '../../lib/utils';

class ChatInput extends Component {

    static propTypes = {
    }
    constructor(){
        super();
        this.stickersLoaded = false;
        this.state = {
            textAreaStyle : {
                height: '40px'
            }
        }
    }

    modifyTextAreaHeight = e => {
        let currHeight = parseInt(this.state.textAreaStyle.height.slice(0,-2));

        if (currHeight < 120) {
            currHeight+=20;
        }

        const newStyle = {...this.state.textAreaStyle, height: currHeight+'px'}
        this.setState({
            textAreaStyle: newStyle
        })
    }

    resetTextAreaHeight = e => {

        this.setState({
            textAreaStyle: {...this.state.textAreaStyle, height: '40px'}
        })
    }

    handleInputChange = e => {
        this.props.changeInputValue(this.props.currentChatId, e.target.value);
        if(e.target.value.length === 1) this.props.sendStartTyping(this.props.currentChatId);
        if(e.target.value.length === 0) this.props.sendStopTyping(this.props.currentChatId);
    }

    toggleStickersView = () => {
        if(!this.props.stickersViewState){
            this.props.showStickersView();

            if(!this.stickersLoaded){
                this.props.loadStickers();
                this.stickersLoaded = true;
            }

        }
        else
            this.props.hideStickersView();
    }

    componentWillReceiveProps(nextProps){
        if (this.props.currentChatId && this.props.currentChatId !== nextProps.currentChatId){            
            this.props.sendStopTyping(this.props.currentChatId);
        }
    }

    componentDidUpdate(prevProps){
        if (this.props.currentChatId !== prevProps.currentChatId){
            const inputValue = this.props.inputValues[this.props.currentChatId] || '';
            if(inputValue) this.props.sendStartTyping(this.props.currentChatId);
        }
    }

    handleClickFileUpload = e => {
            
        Array.from(e.target.files).forEach( file => {
            const data = new FormData();
            data.append('file', file);
            this.props.startFileUpload(data);
        });
        
    }

    render() {
        return(
            <footer className="publisher">
    
                    <textarea
                    placeholder="Write something"
                    style={this.state.textAreaStyle}
                    value={this.props.inputValues[this.props.currentChatId] || ''}
                    onKeyPress={e => {
                        const message = this.props.inputValues[this.props.currentChatId];

                        if (e.key === 'Enter'){
                            if (e.shiftKey){
                                this.modifyTextAreaHeight();
                            }
                            else if(message){
                                e.preventDefault();
                                this.props.sendMessage(constant.MessageTypeText, message);
                                this.props.changeInputValue(this.props.currentChatId, '');
                                this.props.sendStopTyping(this.props.currentChatId);
                                this.resetTextAreaHeight();
                                //chat container element
                                util.scrollElemBottom(e.target.parentElement.previousElementSibling)
                            }
                            else{
                                e.preventDefault();
                            }
                        }
                    }}
                    onChange={this.handleInputChange}>
                    </textarea>

                <div className="align-self-end gap-items">
                    <span className="publisher-btn file-group">
                        <i className="fa fa-paperclip file-browser" onClick={e=> this.fileInputElement.click()}></i>
                        <input type="file" multiple ref={ input => this.fileInputElement = input} 
                        onChange={this.handleClickFileUpload}/>
                    </span>
                    <span 
                    className="publisher-btn"
                    onClick={this.toggleStickersView}>
                        <i className="fa fa-smile-o"></i>
                    </span>
                    <span 
                    className="publisher-btn" 
                    onClick={e=> {
                        const message = this.props.inputValues[this.props.currentChatId];
                        
                        if (message){
                            this.props.sendMessage(constant.MessageTypeText, message);
                            this.props.changeInputValue(this.props.currentChatId, '');
                            this.props.sendStopTyping(this.props.currentChatId);
                        }

                    }}>
                        <i className="fa fa-paper-plane"></i>
                    </span>
                </div>
            </footer>
        )
    }

}

const mapStateToProps = (state) => {
    return {
        currentChatId:state.chat.chatId,        
        stickersViewState: state.chatUI.stickersViewState,
        inputValues: state.chat.inputValues     
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendMessage : (messageType, content) => dispatch(actions.chat.sendMessage(messageType, content)),
        showStickersView : () => dispatch(actions.chatUI.showStickersView()),
        hideStickersView : () => dispatch(actions.chatUI.hideStickersView()),
        loadStickers : () => dispatch(actions.stickers.loadStickers()),
        sendStartTyping: chatId => dispatch(actions.chat.sendStartTyping(chatId)),
        sendStopTyping: chatId => dispatch(actions.chat.sendStopTyping(chatId)),
        changeInputValue: (chatId, value) => dispatch(actions.chat.changeInputValue(chatId, value)),
        startFileUpload: file => dispatch(actions.chat.startFileUpload(file))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatInput);
