import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Login from './containers/Login';
import SignUp from './containers/SignUp';
import Main from './containers/Main';
import About from './components/About';

export default (
	<Switch>
		<Route exact path="/" component={Login} />
		<Route exact path="/signup" component={SignUp} />
		<Route path="/about" component={About} />
		<Route path="/chat" component={Main} />
	</Switch>
);
