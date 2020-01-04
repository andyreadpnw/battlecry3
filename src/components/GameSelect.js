import React, { Component } from "react";
import { Redirect } from "react-router-dom";

export class GameSelect extends Component {
  render() {
    if (this.props.login === true) {
      return <div>hid</div>;
    } else {
      return <Redirect to="/" />;
    }
  }
}

export default GameSelect;
