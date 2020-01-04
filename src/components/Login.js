import React, { Component } from "react";
import { Redirect } from "react-router-dom";

export class Login extends Component {
  // let { loginClicked, onLogin, login, onLoginClicked, onLogout, onSetCurrentPlayer } = this.props;
  constructor() {
    super();
    this.state = {
      currentPlayer: { name: "" },
      submitted: false
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    // this.props.onSubmitNewPlayer(this.state.name);
    this.props.onLoginClicked();
    this.props.onLogin();
    this.props.onSetCurrentPlayer(this.state.currentPlayer);
    this.setSubmitted();
  };

  setSubmitted = () => {
    this.setState({
      ...this.state,
      submitted: true
    });
  };

  handelChange = e => {
    this.setState({
      ...this.state,
      currentPlayer: {
        ...this.state.currentPlayer,
        [e.target.id]: e.target.value
      }
    });
  };

  render() {
    let { loginClicked } = this.props;
    if (loginClicked === true && this.state.submitted === false) {
      return (
        <div>
          <h1>Hi login</h1>
          <form onSubmit={e => this.handleSubmit(e)}>
            <input
              type="text"
              placeholder="Name"
              onChange={e => this.handelChange(e)}
              id="name"
            />
            <input type="submit" value="Submit" />
          </form>
          <button>Cancel</button>
        </div>
      );
    } else if (this.state.submitted === true) {
      return <Redirect to="/gameselect" />;
    } else {
      return <></>;
    }
  }
}

export default Login;
