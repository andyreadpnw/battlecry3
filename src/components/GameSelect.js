import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Canvas from "./Canvas";

export class GameSelect extends Component {
  // let { currentPlayer, login } = this.props;
  constructor() {
    super();
    this.state = {
      currentPlayer: { name: "" },
      games: [],
      gameSelectedID: "none",
      gameSelected: false
    };
    // this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    this.setState({
      ...this.state,
      currentPlayer: {
        ...this.state.currentPlayer,
        name: this.props.currentPlayer.name
      }
    });
  }

  componentDidMount() {
    console.log(this.state.currentPlayer.name);
    let gameArr = [];
    fetch("http://localhost:3000/games")
      .then(res => res.json())
      .then(json => {
        let gameFilter = json.filter(x => x.players).map(y => y.players);

        for (let i = 0; i <= gameFilter.length - 1; i++) {
          let gameFilterHolder = gameFilter[i];
          let playerFilter = gameFilterHolder
            .filter(a => a.name)
            .map(b => b.name);

          if (playerFilter[0] === this.state.currentPlayer.name) {
            gameArr.push(json[i]);
          } else if (playerFilter[1] === this.state.currentPlayer.name) {
            gameArr.push(json[i]);
          }
        }

        this.setState({
          games: gameArr
        });
        console.log(this.state.games);
      });
  }

  handleClick(event) {
    event.preventDefault();
    // console.log(event);
    let id = event.currentTarget.attributes["game-id"].value;
    console.log(id);
    this.setState({
      ...this.state,
      gameSelectedID: id,
      gameSelected: true
    });
  }

  render() {
    console.log(this.state.gameSelectedID);
    var overlay =
      this.state.gameSelectedID !== "none" ? (
        <Canvas id={this.state.gameSelected} />
      ) : null;
    if (this.props.login === true && this.state.gameSelected === false) {
      let displayGames = this.state.games;
      return (
        <ol>
          {overlay}
          Games Name-Turn-Phase
          {displayGames.map(
            function(d, idx) {
              return (
                <li key={idx}>
                  {d.name}
                  {" " + d.turn}
                  {" " + d.phase}
                  <button onClick={e => this.handleClick(e)} game-id={d.id}>
                    select
                  </button>
                </li>
              );
            }.bind(this)
          )}
        </ol>
      );
    } else if (this.state.gameSelected === true) {
      return <ol>{overlay}</ol>;
    } else {
      return <Redirect to="/" />;
    }
  }
}

export default GameSelect;
