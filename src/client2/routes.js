import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from './containers/Login';
import Logout from './containers/Logout';
import SignUp from './containers/SignUp';
import Chat from './containers/Chat';
import NewRoom from './containers/NewRoom';
import About from './components/About';

export default (
	<Switch>
		<Route exact path="/" component={Login} />
		<Route exact path="/signup" component={SignUp} />
		<Route path="/about" component={About} />
		<Route path="/chat" component={Chat} />
		<Route path="/newroom" component={NewRoom} />
		<Route path="/chat/:chatId" component={Chat} />
		<Route path="/logout" component={Logout} />
	</Switch>
);