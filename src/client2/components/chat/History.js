import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';
import * as constant from '../../lib/const';

import HistoryRow from './HistoryRow';

class History extends Component {

    static propTypes = {
    }

    constructor(){
        super();
        this.currentPage = 1;
    }

    onScroll = (e) => {

        const scrollPos = e.target.scrollTop + 0;
        const realScrollPos = scrollPos +  e.target.clientHeight;
        const scrollHeight = e.target.scrollHeight;
        
        // if scroll position is between 2px from bottom
        if(Math.abs(realScrollPos - scrollHeight) < 1){
            if(!this.props.historyLoading){
                this.currentPage++;
                this.props.loadHistory(this.currentPage);  
            } 
        }
        
    }

    componentWillReceiveProps(nextProps){

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

                    <div onScroll={this.onScroll} className="media-list media-list-divided media-list-hover">

                        <header className="media-list-header b-0">
                            <form className="lookup lookup-lg w-100 bb-1 border-light">
                                <input className="w-100 no-radius no-border py-30" type="text" placeholder="Search..." />
                            </form>
                        </header>

                        <div className="history-list media-list-body">

                            {this.props.historyList.map( (history) => {
                                return <HistoryRow key={history._id} history={history} />
                            })}

                        </div>

                    </div>

                </div>

            </aside>

        );
    }

}

const mapStateToProps = (state) => {
    return {
        historyLoading: state.history.historyLoading,
        historyList: state.history.historyList
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadHistoryInitial: () => dispatch(actions.history.loadHistoryInitial()),
        loadHistory: (page) => dispatch(actions.history.loadHistory(page))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(History);
