import React from "react";
import DisplayContainer from "./components/DisplayContainer";
import NavBar from "./components/NavBar";
// import '../styles/index.scss'

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loginClicked: false,
      login: false,
      currentPlayer: {}
    };
  }

  onLogin = () => {
    this.setState({
      login: true
    });
  };

  onSetCurrentPlayer = currentPlayer => {
    this.setState({
      currentPlayer: currentPlayer
    });
  };

  onLoginClicked = () => {
    this.setState({
      loginClicked: !this.state.loginClicked
    });
  };

  onLogout = () => {
    this.setState({
      loginClicked: false,
      login: false
    });
  };

  render() {
    return (
      <div>
        <NavBar
          loginClicked={this.state.loginClicked}
          onLogin={this.onLogin}
          onLoginClicked={this.onLoginClicked}
          login={this.state.login}
          onLogout={this.onLogout}
          currentPlayer={this.state.currentPlayer}
        />
        <DisplayContainer
          loginClicked={this.state.loginClicked}
          onLogin={this.onLogin}
          onLoginClicked={this.onLoginClicked}
          login={this.state.login}
          onLogout={this.onLogout}
          onSetCurrentPlayer={this.onSetCurrentPlayer}
          currentPlayer={this.state.currentPlayer}
        />
      </div>
    );
  }
}
