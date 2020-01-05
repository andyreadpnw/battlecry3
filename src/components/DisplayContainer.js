import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./Login";
import GameSelect from "./GameSelect";

export class DisplayContainer extends Component {
  // let {
  //     loginClicked,
  //     onLogin,
  //     login,
  //     onLoginClicked,
  //     onLogout,
  //     onSetCurrentPlayer,
  //     currentPlayer
  // //   } = this.props;
  render() {
    let {
      loginClicked,
      onLoginClicked,
      onSetCurrentPlayer,
      onLogin,
      currentPlayer,
      login
    } = this.props;

    return (
      <div>
        <Router>
          <Route
            exact
            path="/login"
            render={() => (
              <Login
                loginClicked={loginClicked}
                onLoginClicked={onLoginClicked}
                onSetCurrentPlayer={onSetCurrentPlayer}
                onLogin={onLogin}
              />
            )}
          />
          <Route
            exact
            path="/gameselect"
            render={() => (
              <GameSelect currentPlayer={currentPlayer} login={login} />
            )}
          />
        </Router>
      </div>
    );
  }
}

export default DisplayContainer;
