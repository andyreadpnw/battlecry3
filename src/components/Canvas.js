import React from "react";

let forestHexes = [
  '{"q":-1,"r":-3,"s":4}',
  '{"q":-1,"r":-2,"s":3}',
  '{"q":0,"r":-2,"s":2}',
  '{"q":1,"r":-3,"s":2}',
  '{"q":1,"r":-2,"s":1}',
  '{"q":3,"r":-3,"s":0}',
  '{"q":3,"r":-2,"s":-1}',
  '{"q":4,"r":-2,"s":2}',
  '{"q":5,"r":-2,"s":-3}',
  '{"q":8,"r":-3,"s":-5}',
  '{"q":3,"r":0,"s":-3}',
  '{"q":2,"r":1,"s":-3}',
  '{"q":2,"r":2,"s":-4}',
  '{"q":3,"r":1,"s":-4}',
  '{"q":3,"r":2,"s":-5}',
  '{"q":4,"r":1,"s":-5}',
  '{"q":5,"r":0,"s":-5}',
  '{"q":4,"r":2,"s":-6}',
  '{"q":-1,"r":3,"s":-2}',
  '{"q":0,"r":1,"s":-1}',
  '{"q":-0,"r":0,"s":-0}',
  '{"q":-1,"r":0,"s":1}',
  '{"q":-1,"r":1,"s":0}',
  '{"q":-2,"r":1,"s":1}',
  '{"q":-3,"r":2,"s":1}',
  '{"q":-5,"r":0,"s":5}'
];

let UNITSURL = `http://localhost:3000/units`;

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      hexSize: 30,
      hexOrigin: { x: 300, y: 250 },
      currentHex: { q: 0, r: 0, s: 0, x: 0, y: 0 },
      playerPosition: { q: 0, r: 0, s: 0, x: 0, y: 0 },
      forestHexes: forestHexes,
      greyHexes: [],
      blueHexes: [],
      playerTurn: 1,
      phase: "movement",
      cubeNeighborsArray: [],
      infantryDistance: 6,
      greyUnitHealth: 4,
      blueUnitHealth: 4,
      firingDistance: 0,
      currentGame: 1,
      clickCoordsHolder: [],
      previousPlayerPosition: { q: 0, r: 0, s: 0 }
    };
  }

  componentWillMount() {
    let hexParameters = this.getHexParameters();
    this.setState({
      canvasSize: { canvasWidth: 680, canvasHeight: 500 },
      hexParameters: hexParameters
    });
  }

  componentDidMount() {
    let { id } = this.props;
    // console.log(this.props.id);
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    this.canvasHex.width = canvasWidth;
    this.canvasHex.height = canvasHeight;
    this.canvasCoordinates.width = canvasWidth;
    this.canvasCoordinates.height = canvasHeight;
    this.getCanvasPosition(this.canvasCoordinates);
    this.drawHexes();

    this.setState({
      currentGame: id
    });

    fetch("http://localhost:3000/units")
      .then(res => res.json())
      .then(json => {
        this.setState(
          {
            greyHexes: json
              .filter(
                x =>
                  x.nation == "Confederate" &&
                  x.game_id == this.state.currentGame
              )
              .map(y => JSON.parse(y.coords)),
            blueHexes: json
              .filter(
                x => x.nation == "Union" && x.game_id == this.state.currentGame
              )
              .map(y => JSON.parse(y.coords))
          },
          () => {
            this.drawForestHexes();
            this.drawBlueUnitHexes();
            this.drawGreyUnitHexes();
            console.log(this.state.currentGame);
          }
        );
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.currentHex !== this.state.currentHex) {
      const { q, r, s, x, y } = nextState.currentHex;
      const { canvasWidth, canvasHeight } = this.state.canvasSize;
      const ctx = this.canvasCoordinates.getContext("2d");
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      this.drawNeighborsMove(this.Hex(q, r, s));
      let currentDistanceLine = nextState.currentDistanceLine;
      if (currentDistanceLine != null) {
        for (let i = 0; i <= currentDistanceLine.length - 2; i++) {
          if (i == 0) {
          } else {
            this.drawHex(
              this.canvasCoordinates,
              this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y),
              "lime",
              1,
              "orange"
            );
          }
        }
      }
      this.drawHex(this.canvasCoordinates, this.Point(x, y), "lime", 1, "lime");
      return true;
    }
    return false;
  }

  drawHexes() {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const {
      hexWidth,
      hexHeight,
      vertDist,
      horizDist
    } = this.state.hexParameters;
    const hexOrigin = this.state.hexOrigin;
    let positiveRow = 0;
    for (let r = 0; r <= 4; r++) {
      if (r % 2 == 0 && r !== 0) {
        positiveRow++;
      }
      for (let q = -5; q <= 6; q++) {
        const { x, y } = this.hexToPixel(this.Hex(q - positiveRow, r, -q - r));
        this.drawHex(this.canvasHex, this.Point(x, y), "black", 1, "grey");
      }
    }

    let negativeRow = 0;
    for (let r = -1; r >= -4; r--) {
      if (r % 2 !== 0) {
        negativeRow++;
      }
      for (let q = -5; q <= 6; q++) {
        const { x, y } = this.hexToPixel(this.Hex(q + negativeRow, r));

        this.drawHex(this.canvasHex, this.Point(x, y), "black", 1, "grey");
      }
    }
  }

  drawHex(canvasID, center, lineColor, width, fillColor) {
    for (let i = 0; i <= 5; i++) {
      let start = this.getHexCornerCoord(center, i);
      let end = this.getHexCornerCoord(center, i + 1);
      this.fillHex(canvasID, center, fillColor);
      this.drawLine(canvasID, start, end, lineColor, width);
    }
  }

  drawForestHexes() {
    this.state.forestHexes.map(i => {
      const { q, r, s } = JSON.parse(i);
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "green");
    });
  }

  drawGreyUnitHexes() {
    this.state.greyHexes.map(i => {
      const { q, r, s } = i;
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "red");
    });
  }

  drawBlueUnitHexes() {
    this.state.blueHexes.map(i => {
      const { q, r, s } = i;
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      this.drawHex(this.canvasHex, this.Point(x, y), 1, "black", "blue");
    });
  }

  async fetchNewUnitPosition(q, r, s) {
    console.log(q, r, s);
    let greyCoordString = `{"q":${q},"r":${r},"s":${s}}`;

    await this.patchNewUnitPosition(greyCoordString);

    fetch("http://localhost:3000/units")
      .then(res => res.json())
      .then(json => {
        this.setState(
          {
            greyHexes: json
              .filter(
                x =>
                  x.nation == "Confederate" &&
                  x.game_id == this.state.currentGame
              )
              .map(y => JSON.parse(y.coords)),
            blueHexes: json
              .filter(
                x => x.nation == "Union" && x.game_id == this.state.currentGame
              )
              .map(y => JSON.parse(y.coords))
          },
          () => {
            this.drawHexes();
            this.drawForestHexes();
            this.drawBlueUnitHexes();
            this.drawGreyUnitHexes();
          }
        );
      });
  }

  async patchNewUnitPosition(greyCoordString) {
    fetch(UNITSURL + "/" + 3, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: "1st Mississippi",
        coords: greyCoordString,
        health: 4,
        nation: "Confederate",
        game_id: 1
      })
    }).then(function(resp) {
      if (Math.floor(resp.status / 200) === 1) {
        console.log("Great ");
      } else {
        console.log("ERROR", resp);
      }
    });
  }

  getHexCornerCoord(center, i) {
    let angle_deg = 60 * i + 30;
    let angle_rad = (Math.PI / 180) * angle_deg;
    let x = center.x + this.state.hexSize * Math.cos(angle_rad);
    let y = center.y + this.state.hexSize * Math.sin(angle_rad);
    return this.Point(x, y);
  }

  getHexParameters() {
    let hexHeight = this.state.hexSize * 2;
    let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    let vertDist = (hexHeight * 3) / 4;
    let horizDist = hexWidth;
    return { hexWidth, hexHeight, vertDist, horizDist };
  }

  getCanvasPosition(canvasID) {
    let rect = canvasID.getBoundingClientRect();
    this.setState({
      canvasPosition: {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      }
    });
  }

  hexToPixel(h) {
    let hexOrigin = this.state.hexOrigin;
    let x = this.state.hexSize * Math.sqrt(3) * (h.q + h.r / 2) + hexOrigin.x;
    let y = ((this.state.hexSize * 3) / 2) * h.r + hexOrigin.y;
    return this.Point(x, y);
  }

  pixelToHex(p) {
    let size = this.state.hexSize;
    let origin = this.state.hexOrigin;
    let q =
      (((p.x - origin.x) * Math.sqrt(3)) / 3 - (p.y - origin.y) / 3) / size;
    let r = ((p.y - origin.y) * 2) / 3 / size;
    return this.Hex(q, r, -q - r);
  }

  cubeDirection(direction) {
    const cubeDirections = [
      this.Hex(1, 0, -1),
      this.Hex(1, -1, 0),
      this.Hex(0, -1, 1),
      this.Hex(-1, 0, 1),
      this.Hex(-1, 1, 0),
      this.Hex(0, 1, -1)
    ];
    return cubeDirections[direction];
  }

  cubeAdd(a, b) {
    return this.Hex(a.q + b.q, a.r + b.r, a.s + b.s);
  }

  cubeSubtract(a, b) {
    return this.Hex(a.q - b.q, a.r - b.r, a.s - b.s);
  }

  getCubeNeighbor(h, direction) {
    return this.cubeAdd(h, this.cubeDirection(direction));
  }

  cubeRound(cube) {
    var rx = Math.round(cube.q);
    var ry = Math.round(cube.r);
    var rz = Math.round(cube.s);

    var x_diff = Math.abs(rx - cube.q);
    var y_diff = Math.abs(ry - cube.r);
    var z_diff = Math.abs(rz - cube.s);

    if (x_diff > y_diff && x_diff > z_diff) {
      rx = -ry - rz;
    } else if (y_diff > z_diff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }
    return this.Hex(rx, ry, rz);
  }

  getDistanceLine(a, b) {
    let dist = this.cubeDistance(a, b);
    if (dist < this.state.infantryDistance) {
      let arr = [];
      for (let i = 0; i <= dist; i++) {
        let center = this.hexToPixel(
          this.cubeRound(this.cubeLinearInt(a, b, (1.0 / dist) * i))
        );
        arr = [].concat(arr, center);
      }
      this.setState({
        currentDistanceLine: arr
      });
    }
  }

  cubeDistance(a, b) {
    const { q, r, s } = this.cubeSubtract(a, b);
    return (Math.abs(q) + Math.abs(r) + Math.abs(s)) / 2;
  }

  cubeLinearInt(a, b, t) {
    return this.Hex(
      this.linearInt(a.q, b.q, t),
      this.linearInt(a.r, b.r, t),
      this.linearInt(a.s, b.s, t)
    );
  }

  linearInt(a, b, t) {
    return a + (b - a) * t;
  }

  Point(x, y) {
    return { x: x, y: y };
  }

  Hex(q, r, s) {
    return { q: q, r: r, s: s };
  }

  drawLine(canvasID, start, end, color, width) {
    const ctx = canvasID.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  }

  fillHex(canvasID, center, fillColor) {
    let c0 = this.getHexCornerCoord(center, 0);
    let c1 = this.getHexCornerCoord(center, 1);
    let c2 = this.getHexCornerCoord(center, 2);
    let c3 = this.getHexCornerCoord(center, 3);
    let c4 = this.getHexCornerCoord(center, 4);
    let c5 = this.getHexCornerCoord(center, 5);
    const ctx = canvasID.getContext("2d");
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.7;
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c5.x, c5.y);
    ctx.closePath();
    ctx.fill();
  }

  drawHexCoordinates(canvasID, center, h) {
    const ctx = canvasID.getContext("2d");
    ctx.fillText(h.q, center.x + 6, center.y);
    ctx.fillText(h.r, center.x - 3, center.y + 15);
    ctx.fillText(h.s, center.x - 12, center.y);
  }

  findInBlueHexes(q, r, s) {
    return this.state.blueHexes.filter(item => {
      return item.q === q && item.r === r && item.s === s;
    });
  }

  findInGreyHexes(q, r, s) {
    return this.state.greyHexes.filter(item => {
      return item.q === q && item.r === r && item.s === s;
    });
  }

  drawNeighborsClick(h) {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight } = this.state.hexParameters;
    let cubeNeighborsArray = [];

    for (let i = 0; i <= 5; i++) {
      const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      if (
        x > hexWidth / 2 &&
        x < canvasWidth - hexWidth / 2 &&
        y > hexHeight / 2 &&
        y < canvasHeight - hexHeight / 2
      ) {
        cubeNeighborsArray.push([q, r, s]);
        this.setState(
          {
            cubeNeighborsArray: cubeNeighborsArray
          },
          () => {
            console.log(this.state.cubeNeighborsArray);
          }
        );
      }
    }
  }

  drawNeighborsMove(h) {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight } = this.state.hexParameters;
    // let cubeNeighborsArray = [];
    let formerPositionHolder = { q: 0, r: 0, s: 0 };

    for (let i = 0; i <= 5; i++) {
      const { q, r, s } = this.getCubeNeighbor(this.Hex(h.q, h.r, h.s), i);
      const { x, y } = this.hexToPixel(this.Hex(q, r, s));
      if (
        x > hexWidth / 2 &&
        x < canvasWidth - hexWidth / 2 &&
        y > hexHeight / 2 &&
        y < canvasHeight - hexHeight / 2
      ) {
        // cubeNeighborsArray.push([q, r, s]);
        // this.setState({
        //   cubeNeighborsArray: cubeNeighborsArray
        // });
      }
      if (this.findInBlueHexes(q, r, s).length !== 0) {
        this.findInBlueHexes(q, r, s);
        console.log(q, r, s);
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          formerPositionHolder.q = q;
          formerPositionHolder.r = r;
          formerPositionHolder.s = s;
          this.setState({
            previousPlayerPosition: formerPositionHolder
          });
          this.drawHex(this.canvasCoordinates, this.Point(x, y), "blue", 2);
        }
      }

      if (this.findInGreyHexes(q, r, s).length !== 0) {
        this.findInGreyHexes(q, r, s);
        if (
          x > hexWidth / 2 &&
          x < canvasWidth - hexWidth / 2 &&
          y > hexHeight / 2 &&
          y < canvasHeight - hexHeight / 2
        ) {
          formerPositionHolder.q = q;
          formerPositionHolder.r = r;
          formerPositionHolder.s = s;
          this.setState({
            previousPlayerPosition: formerPositionHolder
          });
          this.drawHex(this.canvasCoordinates, this.Point(x, y), "blue", 2);
        }
      }
    }
  }

  handleMouseMove(e) {
    const { canvasWidth, canvasHeight } = this.state.canvasSize;
    const { hexWidth, hexHeight } = this.state.hexParameters;
    const { left, top } = this.state.canvasPosition;
    let offsetX = e.pageX - left;
    let offsetY = e.pageY - top;
    const { q, r, s } = this.cubeRound(
      this.pixelToHex(this.Point(offsetX, offsetY))
    );
    const { x, y } = this.hexToPixel(this.Hex(q, r, s));

    if (this.state.phase === "firing") {
      let playerPosition = this.state.playerPosition;
      let fireDist = this.getDistanceLine(
        this.Hex(playerPosition.q, playerPosition.r, playerPosition.s),
        this.Hex(q, r, s)
      );
      this.setState({
        firingDistance: fireDist
      });
    }

    // console.log(this.Hex(q, r, s));

    if (
      x > hexWidth / 2 &&
      x < canvasWidth - hexWidth / 2 &&
      y > hexHeight / 2 &&
      y < canvasHeight - hexHeight / 2
    ) {
      this.setState({
        currentHex: { q, r, s, x, y }
      });
    }
  }

  handleClick(e) {
    const { left, top } = this.state.canvasPosition;
    let offsetX = e.pageX - left;
    let offsetY = e.pageY - top;
    const { q, r, s } = this.cubeRound(
      this.pixelToHex(this.Point(offsetX, offsetY))
    );
    this.drawNeighborsClick(
      this.Hex(
        this.state.previousPlayerPosition.q,
        this.state.previousPlayerPosition.r,
        this.state.previousPlayerPosition.s
      )
    );
    this.setState(
      {
        clickCoordsHolder: [
          ...this.state.clickCoordsHolder,
          this.state.currentHex
        ]
      },
      () => {
        if (this.state.phase == "movement") {
          for (let i = 0; i <= this.state.cubeNeighborsArray.length; i++) {
            if (this.state.cubeNeighborsArray[i] != null) {
              if (
                this.state.currentHex.q ===
                  this.state.cubeNeighborsArray[i][0] &&
                this.state.currentHex.r ===
                  this.state.cubeNeighborsArray[i][1] &&
                this.state.currentHex.s === this.state.cubeNeighborsArray[i][2]
              ) {
                this.fetchNewUnitPosition(q, r, s);
                console.log(this.state.currentHex);
                console.log(this.state.cubeNeighborsArray[i]);
                console.log(this.state.clickCoordsHolder.slice(-1)[0]);
              }
            }
          }
        }
      }
    );
  }

  render() {
    return (
      <div>
        <canvas ref={canvasHex => (this.canvasHex = canvasHex)}> </canvas>
        {/* prettier-ignore */}
        <canvas ref={canvasCoordinates => (this.canvasCoordinates = canvasCoordinates)} onMouseMove={this.handleMouseMove} onClick={this.handleClick}> </canvas>
      </div>
    );
  }
}
