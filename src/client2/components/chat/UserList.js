import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../actions';

import AvatarImage from '../AvatarImage';

class UserList extends Component {

    static propTypes = {
    }

    componentWillReceiveProps(nextProps){

    }

	componentDidMount() {
        
    }
    
    render() {

        console.log("ssssaaa",this.props.users);

        return (
            <div>

                {this.props.isLoading ?
                    <div className="spinner-linear">
                        <div className="line"></div>
                    </div>: null
                }

                <header className="media-list-header b-0">
                    <form className="lookup lookup-lg w-100 bb-1 border-light">
                        <input className="w-100 no-radius no-border py-30" type="text" placeholder="Search..." />
                    </form>
                </header>
                
                <div className="media-list-body bg-white">

                    {this.props.users.map( (user) => {

                        let fileId = null;
                        if(user.avatar && user.avatar.thumbnail)
                            fileId = user.avatar.thumbnail.nameOnServer;

                        return <div className="media align-items-center" key={user._id}>

                            <span className="flexbox flex-grow gap-items text-truncate">

                                <AvatarImage fileId={fileId} />

                                <div className="media-body text-truncate">
                                    <h6>{user.name}</h6>
                                    <small>
                                        <span>{user.description}</span>
                                    </small>
                                </div>

                            </span>

                        </div>

                    })}


                </div>
                
            </div>
        );
    }

}

const mapStateToProps = (state) => {
    return {
        isLoading: state.userlist.loading,
        users: state.userlist.users
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadUserList: (page) => dispatch(actions.userlist.loadUserList(page))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserList);
