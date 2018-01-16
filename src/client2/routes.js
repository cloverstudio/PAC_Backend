import React from "react";
import { Route, Switch } from "react-router-dom";

import * as util from "./lib/utils";

import Login from "./containers/Login";
import Logout from "./containers/Logout";
import SignUp from "./containers/SignUp";
import Chat from "./containers/Chat";
import Room from "./containers/Room";
import Search from "./containers/Search";
import Favorites from "./containers/Favorites";
import Profile from "./containers/Profile";
import Password from "./containers/Password";
import About from "./components/About";

export default (
  <Switch>
    <Route exact path={`${util.url("/")}`} component={Login} />
    <Route exact path={`${util.url("/signup")}`} component={SignUp} />
    <Route path={`${util.url("/about")}`} component={About} />
    <Route path={`${util.url("/chat")}`} component={Chat} />
    <Route path={`${util.url("/newroom")}`} component={Room} />
    <Route path={`${util.url("/editroom/:roomId")}`} component={Room} />
    <Route path={`${util.url("/chat/:chatId")}`} component={Chat} />
    <Route path={`${util.url("/search")}`} component={Search} />
    <Route path={`${util.url("/favorites/:chatId")}`} component={Favorites} />
    <Route path={`${util.url("/favorites")}`} component={Favorites} />
    <Route path={`${util.url("/profile")}`} component={Profile} />
    <Route path={`${util.url("/password")}`} component={Password} />
    <Route path={`${util.url("/logout")}`} component={Logout} />
  </Switch>
);
