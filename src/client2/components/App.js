import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Routes from '../routes';

import * as constant from '../lib/const';
import * as strings from '../lib/strings';
import * as config from '../lib/config';

import * as style from '../styles/main.scss'

import Ecnryption from '../lib/encryption/encryption';
import SocketManager from '../lib/SocketManager';

class App extends Component {

    componentWillMount = () => {
        Ecnryption.init();
    }

    render(){
        return <div>
            { Routes }
        </div>;
    }
}

export default App;
