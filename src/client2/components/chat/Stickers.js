import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';

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
{/* TODO: 1x loop only */}
                <div className="card-body">
                    <ul className="nav nav-tabs">
                        {this.props.stickers.map((stickerGroup, i) => {

                            let navClass = i === this.state.index ? 'nav-link active' : 'nav-link';

                            return(
                                <li key={i} className="nav-item" onClick={e=> this.changeStickersTab(i)}>
                                    <span className={navClass}>
                                        <img src={'https://spika.chat'+stickerGroup.mainTitlePic}/>
                                    </span> 
                                </li>
                            ) 
                        })}
                    </ul>

                    <div className="tab-content">
                        {this.props.stickers.map( (stickerGroup, i) => {
                            let paneClass = i === this.state.index ? 'tab-pane fade active show' : 'tab-pane fade'

                            return(
                                <div key={i} className={paneClass}>
                                    {stickerGroup.list.map( sticker => {
                                        return(
                                            <span key={sticker.smallPic} className="dropdown-item">
                                                <img src={'https://spika.chat'+sticker.smallPic} onClick={e => this.props.sendMessage(constant.MessageTypeSticker, sticker.fullPic)}/>
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        })}
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
