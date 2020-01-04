import React, { Component } from "react";
import { Link } from "react-router-dom";

export class NavBar extends Component {
  // let { loginClicked, onLogin, login, onLoginClicked, onLogout } = this.props;
  handleClick = () => {
    this.props.onLoginClicked();
  };

  handleLogout = () => {
    this.props.onLogout();
  };

  render() {
    let { login } = this.props;

    if (login === false) {
      return (
        <>
          <Link to="/login">
            <button onClick={this.handleClick}>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </>
      );
    }
    return (
      <div>
        <button onClick={this.handleLogout}>Logout</button>
      </div>
    );
  }
}

export default NavBar;
