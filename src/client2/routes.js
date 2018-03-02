import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

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
import Note from "./containers/Note";

export default (

  <Switch>
    <Route exact path={`${util.url("/")}`} component={Login} />
    <Route exact path={`${util.url("/signup")}`} component={SignUp} />
    <Route path={`${util.url("/about")}`} component={About} />
    <Route exact path={`${util.url("/chat")}`} component={Chat} />
    <Route path={`${util.url("/chat/:chatId")}`} component={Chat} />
    <Route path={`${util.url("/newroom")}`} component={Room} />
    <Route path={`${util.url("/editroom/:roomId")}`} component={Room} />
    <Route path={`${util.url("/search")}`} component={Search} />
    <Route exact path={`${util.url("/favorites")}`} component={Favorites} key="global favorites" />
    <Route path={`${util.url("/favorites/:chatId")}`} component={Favorites} />
    <Route path={`${util.url("/note/:chatId")}`} component={Note} />
    <Route path={`${util.url("/profile")}`} component={Profile} />
    <Route path={`${util.url("/password")}`} component={Password} />
    <Route path={`${util.url("/logout")}`} component={Logout} />
    <Redirect from='*' to={`${util.url("/")}`} />
  </Switch>

);
