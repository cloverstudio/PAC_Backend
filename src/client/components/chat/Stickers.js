import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';
import * as config from '../../lib/config';

class Stickers extends Component {

    static propTypes = {
    }
    constructor(){
        super();
        this.state = {

            index: 0
        
        }
    }

    changeStickersTab = index => {
        this.setState({
            index
        })
    }

    render() {
        let cardClass = this.props.visible ? 'card stickers-container stickers-visible' : 'card stickers-container';

        let stickersNavTabs = [];
        let stickersGridItems = [];

        this.props.stickers.forEach( (stickerGroup, index) => {
            let navClass = this.state.index === index ? 'nav-link active' : 'nav-link';
            let paneClass= this.state.index === index ? 'tab-pane fade active show' : 'tab-pane fade'; 

            stickersNavTabs.push(
                <li key={index} className="nav-item" onClick={e => this.changeStickersTab(index) }>
                    <span className={navClass}>
                        <img className="stickers-nav" src={config.mediaBaseURL + stickerGroup.mainTitlePic}/>
                    </span>
                </li>);
            
            stickersGridItems.push(
               <div key={index} className={paneClass}>
                    {stickerGroup.list.map( sticker => 
                            <span key={sticker.smallPic} className='dropdown-item' onClick={() => this.props.sendMessage(constant.MessageTypeSticker, sticker.fullPic)}>
                                <img src={config.mediaBaseURL + sticker.smallPic}/>
                            </span>
                        )}
                </div>);

        });

        return (
            <div className={cardClass}>
            
                {this.props.stickersLoading ?
                    <div className="card-loading reveal">
                        <div className="spinner-dots">
                        <span className="dot1"></span>
                        <span className="dot2"></span>
                        <span className="dot3"></span>
                        </div>
                    </div> : null
                }

                <div className="card-body">
                    <ul className="nav nav-tabs">
                        {stickersNavTabs}
                    </ul>

                    <div className="tab-content">
                        {stickersGridItems}
                    </div>
                </div>

            </div>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        visible: state.chatUI.stickersViewState,
        stickersLoading: state.stickers.loading,
        stickers: state.stickers.stickers
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sendMessage : (messageType, content) => dispatch(actions.chat.sendMessage(messageType, content)),
        hideStickersView: () => dispatch(actions.chatUI.hideStickersView())        
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Stickers);
