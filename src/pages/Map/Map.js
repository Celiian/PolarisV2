import React, { useState, useEffect } from "react";
import { Hex, HexGrid, HexUtils, Layout } from "react-hexgrid";

import axios from "axios";
import "./Map.css";
import Hexagon from "./Hexagons";
import Controls from "./Controls";
import Patterns from "./Patterns";
import HexModal from "./HexModal";
import ShipModal from "./ShipModal";
//import MiniMap from "./MiniMap";
//import styled from "styled-components";

import Ship1 from "../../assets/img/ships/ship1/ship/ship.png";
import Ship2 from "../../assets/img/ships/ship2/ship/ship.png";
import Ship3 from "../../assets/img/ships/ship3/ship/ship.png";
import Ship4 from "../../assets/img/ships/ship4/ship/ship.png";

import food from "../../assets/img/ressources/foods/food.png";
import water from "../../assets/img/ressources/foods/water.png";

import diamonds from '../../assets/img/ressources/mine/diamonds.png'
import iron from '../../assets/img/ressources/mine/iron.png'
import uranium from '../../assets/img/ressources/mine/uranium.png'

const ships = {
  Ship1,
  Ship2,
  Ship3,
  Ship4,
};

const ressourceImages = {
  "diamonds": diamonds,
  "uranium": uranium,
  "energy": uranium,
  "freeze-dried": food,
  "steel": iron,
  water: water,
  "hydrogene": uranium,

};

function Map() {
  const [hexagonClassNames, setHexagonClassNames] = useState({});
  const [hexagonInPath, setHexagonInPath] = useState({});
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [selectedShip, setSelectedShip] = useState(null);
  const [selectedHex, setSelectedHex] = useState(null);
  const [hexagons, setHexagons] = useState([]);
  const hexagonSize = { x: 12, y: 12 };
  const [speed, setSpeed] = useState(100);
  const [scale, setScale] = useState(0.6);
  const [map, setMap] = useState([]);
  const [mapSize, setMapSize] = useState(0);
  const [mouseDown, setMouseDown] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(null);
  const [lastMouseY, setLastMouseY] = useState(null);
  const [isHexModalOpen, setIsHexModalOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const [playerData, setPlayerData] = useState({});
  const [roomData, setRoomData] = useState({});
  const [players, setPlayers] = useState([]);
  const [ressources, setRessources] = useState({});

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const viewBoxWidth = screenWidth;
  const viewBoxHeight = screenHeight;
  const viewBoxX = 0 - viewBoxWidth / 2;
  const viewBoxY = 0 - viewBoxHeight / 2;

  const initialViewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
  const [viewBox, setViewBox] = useState(initialViewBox);

  const handleMouseDown = (event) => {
    setMouseDown(true);
    setLastMouseX(event.clientX);
    setLastMouseY(event.clientY);
  };

  const handleMouseMove = (event) => {
    if (mouseDown) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      setLastMouseX(event.clientX);
      setLastMouseY(event.clientY);

      const newX = parseFloat(viewBox.split(" ")[0]) - deltaX;
      const newY = parseFloat(viewBox.split(" ")[1]) - deltaY;
      const newViewBox = `${newX} ${newY} ${viewBox.split(" ")[2]} ${
        viewBox.split(" ")[3]
      }`;
      setViewBox(newViewBox);
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  const handleZoom = (event) => {
    const newZoom = event.target.value;
    setScale(newZoom);
    updateViewBox();
  };

  const moveShip = (ship) => {
    setMoving(true);
    const shipHex = ship.coord;

    var newHexagonClassNames = {};
    let updateHexagonClassNames = { ...hexagonClassNames }; // make a copy of the current classNames object
    for (var index in updateHexagonClassNames) {
      if (
        updateHexagonClassNames[index] != "movable" &&
        updateHexagonClassNames[index] != "path"
      ) {
        newHexagonClassNames[index] = updateHexagonClassNames[index];
      }
    }
    setHexagonClassNames(newHexagonClassNames);
    setHexagonInPath([]);
    map.forEach((item) => {
      const hexa = JSON.parse(item);
      if (hexa.fill == "void") {
        const hex = hexa.coord;

        const distance = HexUtils.distance(shipHex, hex);

        if (distance <= 5) {
          const hexKey = `${hex.q},${hex.r},${hex.s}`;

          setHexagonClassNames((prev) => {
            const updated = { ...prev };
            updated[hexKey] = "movable";
            return updated;
          });

          setHexagonInPath((prev) => {
            const updated = { ...prev };
            updated[hexKey] = true;
            return updated;
          });
        }
      }
    });
    drawMap();
  };

  const swapHexagons = (hex1, hex2) => {
    const newMap = [...map];
    const index1 = newMap.findIndex(
      (item) =>
        JSON.parse(item).coord.q === hex1.coord.q &&
        JSON.parse(item).coord.r === hex1.coord.r &&
        JSON.parse(item).coord.s === hex1.coord.s
    );
    const index2 = newMap.findIndex(
      (item) =>
        JSON.parse(item).coord.q === hex2.q &&
        JSON.parse(item).coord.r === hex2.r &&
        JSON.parse(item).coord.s === hex2.s
    );

    if (index1 !== -1 && index2 !== -1) {
      const hex1Data = JSON.parse(newMap[index1]);
      const hex2Data = JSON.parse(newMap[index2]);

      // Swap the ships' coordinates
      const tempShipCoord = hex1Data.coord;
      hex1Data.coord = hex2Data.coord;
      hex2Data.coord = tempShipCoord;

      hex1Data.fill = hex1.fill;

      newMap[index1] = JSON.stringify(hex1Data);
      newMap[index2] = JSON.stringify(hex2Data);
      setMap(newMap);

      // Return the two new hexagons after swapping their coordinates
      return [hex1Data, hex2Data];
    }
  };

  const getRotationDegree = (hex1, hex2) => {
    const directionVectors = {
      "1,-1,0": "45",
      "0,-1,1": "-45",
      "1,0,-1": "90",
      "-1,0,1": "-90",
      "-1,1,0": "-135",
      "0,1,-1": "135",
    };

    const hexDifference = new Hex(
      hex2.q - hex1.q,
      hex2.r - hex1.r,
      hex2.s - hex1.s
    );
    const hexDifferenceKey = `${hexDifference.q},${hexDifference.r},${hexDifference.s}`;
    for (const [key, value] of Object.entries(directionVectors)) {
      if (key === hexDifferenceKey) {
        return parseInt(value, 10);
      }
    }

    // Return -1 if the hexagons are not neighbors
    return -1;
  };

  const handleHexClick = async (hexa) => {
    if (moving) {
      if (
        hexagonClassNames[`${hexa.coord.q},${hexa.coord.r},${hexa.coord.s}`] ==
          "movable" ||
        hexagonClassNames[`${hexa.coord.q},${hexa.coord.r},${hexa.coord.s}`] ==
          "path"
      ) {
        let path = findPath(selectedShip.coord, hexa.coord);
        path.shift();
        let ship = selectedShip;
        setHexagonInPath([]);
        for (let indexPath in path) {
          let nextCase = path[indexPath];
          let rotation = getRotationDegree(ship.coord, nextCase);
          ship = selectedShip;
          if (ship.fill.split("/").length > 1) {
            ship.fill = ship.fill.split("/")[0] + "/" + rotation;
          } else {
            ship.fill += "/" + rotation;
          }
          let newHexas = swapHexagons(ship, nextCase);
          setSelectedShip(newHexas[0]);
          ship = newHexas[0];
          let newHexagonClassNames = {};
          let updateHexagonClassNames = { ...hexagonClassNames };
          for (let index in updateHexagonClassNames) {
            if (
              updateHexagonClassNames[index] != "movable" &&
              updateHexagonClassNames[index] != "path"
            ) {
              newHexagonClassNames[index] = updateHexagonClassNames[index];
            }
          }

          setHexagonClassNames(newHexagonClassNames);
          await delay(600);
        }
        setMoving(false);
        setSelectedShip(null);
      }
    } else {
      console.log(HexUtils.distance(hexa.coord, { q: 0, r: 0, s: 0 }));
      var desc = "";
      var img = "";
      var style =  ""
      if (hexa.fill == "void") {
        desc = "Well it's just plain void, what were you expecting ? ";
        img =
          "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80";
      }
      if(hexa.fill == "mine"){
        desc = "Mineral planets are rich in valuable minerals and ores, making them prime locations for mining and resource extraction. However, they may also be home to dangerous environmental conditions and hostile alien species.";
        img =
          "https://t4.ftcdn.net/jpg/01/82/66/81/360_F_182668101_Lx58VcbiiS03jhaYSDdhuz0zH3CD9pSL.jpg";
          style = "mine";
      }
      if(hexa.fill == "agri"){
        desc = "Agricultural planets are characterized by their fertile soil and abundant plant life, making them ideal for farming and food production. These planets are often highly populated and feature bustling cities and agricultural communities.";
        img =
          "https://4kwallpapers.com/images/walls/thumbs_3t/8758.jpg";
          style="agri"
      }
      if(hexa.fill == "atmo"){
        desc = "Atmospheric planets in the game are characterized by their thick atmospheres and often feature unique weather patterns, making them challenging to explore but also rich in resources.";
        img =
          "https://w0.peakpx.com/wallpaper/538/645/HD-wallpaper-planet-124d-alien-black-cosmos-darkness-light-neon-space-ufo-violet-thumbnail.jpg";
        style= 'atmo'
      }
      if(hexa.fill == "indu"){
        desc = "Industrial planets are highly developed, with advanced infrastructure and a focus on manufacturing and production. Players can expect to find a wide range of industrial resources and technology on these planets.";
        img =
          "https://i.pinimg.com/736x/5c/6a/96/5c6a965591f7969cbf5de9684ba0840d.jpg";
        style="indu"
      }
      const hex = { name: hexa.fill, image: img, description: desc, style : style };
      setSelectedHex(hex);
      setIsHexModalOpen(true);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleShipClick = (hexa) => {
    setSelectedShip(hexa);
    setIsShipModalOpen(true);
  };

  const findPath = (hexStart, hexEnd) => {
    const openSet = [hexStart];
    const closedSet = [];

    const cameFrom = {};

    const gScore = {};
    gScore[`${hexStart.q},${hexStart.r},${hexStart.s}`] = 0;

    const fScore = {};
    fScore[`${hexStart.q},${hexStart.r},${hexStart.s}`] = HexUtils.distance(
      hexStart,
      hexEnd
    );

    while (openSet.length > 0) {
      const current = openSet.reduce((a, b) =>
        fScore[`${a.q},${a.r},${a.s}`] < fScore[`${b.q},${b.r},${b.s}`] ? a : b
      );

      if (
        current.q === hexEnd.q &&
        current.r === hexEnd.r &&
        current.s === hexEnd.s
      ) {
        const path = [current];
        while (cameFrom[`${path[0].q},${path[0].r},${path[0].s}`]) {
          path.unshift(cameFrom[`${path[0].q},${path[0].r},${path[0].s}`]);
        }
        return path;
      }

      openSet.splice(openSet.indexOf(current), 1);
      closedSet.push(current);

      const neighbors = HexUtils.neighbors(current);
      neighbors.forEach((neighbor) => {
        if (
          closedSet.some(
            (hex) =>
              hex.q === neighbor.q &&
              hex.r === neighbor.r &&
              hex.s === neighbor.s
          )
        ) {
          return;
        }

        const tentativeGScore =
          gScore[`${current.q},${current.r},${current.s}`] + 1;

        if (
          !openSet.some(
            (hex) =>
              hex.q === neighbor.q &&
              hex.r === neighbor.r &&
              hex.s === neighbor.s
          )
        ) {
          openSet.push(neighbor);
        } else if (
          tentativeGScore >= gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`]
        ) {
          return;
        }

        cameFrom[`${neighbor.q},${neighbor.r},${neighbor.s}`] = current;
        gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] = tentativeGScore;
        fScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] =
          tentativeGScore + HexUtils.distance(neighbor, hexEnd);
      });
    }

    return null;
  };

  const hexToPixel = (q, r, size) => {
    const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = size * ((3 / 2) * r);

    return { x, y };
  };

  const isVisible = (hexa) => {
    const hexaCoord = hexToPixel(hexa.q, hexa.r, hexagonSize.x);
    const viewBoxValues = viewBox.split(" ");
    const viewBoxX = parseFloat(viewBoxValues[0]);
    const viewBoxY = parseFloat(viewBoxValues[1]);
    const viewBoxWidth = parseFloat(viewBoxValues[2]);
    const viewBoxHeight = parseFloat(viewBoxValues[3]);

    const distanceThreshold = hexagonSize.x * 4;

    if (
      hexaCoord.x >= viewBoxX - distanceThreshold &&
      hexaCoord.x <= viewBoxX + viewBoxWidth + distanceThreshold &&
      hexaCoord.y >= viewBoxY - distanceThreshold &&
      hexaCoord.y <= viewBoxY + viewBoxHeight + distanceThreshold
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleHexagonMouseEnter = (hexa) => {
    var newHexagonClassNames = {};
    let updateHexagonClassNames = { ...hexagonClassNames }; // make a copy of the current classNames object
    for (var hex in updateHexagonClassNames) {
      if (updateHexagonClassNames[hex] != "path") {
        newHexagonClassNames[hex] = updateHexagonClassNames[hex];
      } else {
        newHexagonClassNames[hex] = "movable";
      }
    }
    setHexagonClassNames(newHexagonClassNames);

    var hexaPath = findPath(selectedShip.coord, hexa.coord);
    hexaPath.shift();

    for (var hex of hexaPath) {
      const hexKey = `${hex.q},${hex.r},${hex.s}`;
      newHexagonClassNames[hexKey] = "path"; // update only the class name for hexagons along the path
    }

    setHexagonClassNames(newHexagonClassNames); // set the updated classNames object
  };

  const handleHexagonMouseLeave = (hexa) => {};

  // Call drawMap() after updating classNames
  useEffect(() => {
    drawMap();
  }, [hexagonClassNames, selectedShip]);

  const drawMap = () => {
    var newHexagons = [];
    map.forEach((item, index) => {
      const hexa = JSON.parse(item);
      if (isVisible(hexa.coord)) {
        var hexagon = null;
        const key = `${hexa.coord.q},${hexa.coord.r},${hexa.coord.s}`;

        if (hexa.fill === "void") {
          hexagon = (
            <Hexagon
              style={hexagonClassNames[key] || "void"}
              fill=""
              hexa={hexa.coord}
              handleClick={() => handleHexClick(hexa)}
              key={key}
              index={key}
              onMouseEnter={
                hexagonInPath[key] ? () => handleHexagonMouseEnter(hexa) : null
              }
              onMouseLeave={
                hexagonInPath[key] ? () => handleHexagonMouseLeave(hexa) : null
              }
            ></Hexagon>
          );
        } else if (hexa.type == "base") {
          hexagon = (
            <Hexagon
              style="planet"
              fill={hexa.type + "/" + hexa.fill}
              hexa={hexa.coord}
              handleClick={() => handleShipClick(hexa)}
              key={key}
              index={key}
              onMouseEnter={null}
              onMouseLeave={null}
            ></Hexagon>
          );
        } else {
          hexagon = (
            <Hexagon
              style={hexagonClassNames[key] || "planet"}
              fill={hexa.fill}
              hexa={hexa.coord}
              handleClick={() => handleHexClick(hexa)}
              key={key}
              index={key}
              onMouseEnter={null}
              onMouseLeave={null}
            ></Hexagon>
          );
        }
        newHexagons.push(hexagon);
      }
    });
    setHexagons(newHexagons);
  };

  useEffect(() => {
    if (map.length > 0) {
      drawMap();
    }
  }, [map, viewBox]);

  const updateViewBox = () => {
    const centerX =
      parseFloat(viewBox.split(" ")[0]) + parseFloat(viewBox.split(" ")[2]) / 2;
    const centerY =
      parseFloat(viewBox.split(" ")[1]) + parseFloat(viewBox.split(" ")[3]) / 2;
    const newWidth = 100 / scale;
    const newHeight = 100 / scale;
    const newViewBox = `${centerX - newWidth / 2} ${
      centerY - newHeight / 2
    } ${newWidth} ${newHeight}`;
    setViewBox(newViewBox);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      setSpeed(100);
      const { keyCode } = event;
      let newViewBox = viewBox;
      switch (keyCode) {
        case 37: // Left arrow key
          newViewBox = `${parseFloat(viewBox.split(" ")[0]) - speed} ${
            viewBox.split(" ")[1]
          } ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
          break;
        case 38: // Up arrow key
          newViewBox = `${viewBox.split(" ")[0]} ${
            parseFloat(viewBox.split(" ")[1]) - speed
          } ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
          break;
        case 39: // Right arrow key
          newViewBox = `${parseFloat(viewBox.split(" ")[0]) + speed} ${
            viewBox.split(" ")[1]
          } ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
          break;
        case 40: // Down arrow key
          newViewBox = `${viewBox.split(" ")[0]} ${
            parseFloat(viewBox.split(" ")[1]) + speed
          } ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
          break;
        default:
          break;
      }
      setViewBox(newViewBox);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewBox, speed]);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("Starting connection to WebSocket Server");
      var ws = new WebSocket("ws://localhost:8000/map/");

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.type == "map") {
          setMap(response.data.map);
        } else if (response.type == "player") {
          setPlayerData(response.data);
          setRessources(response.data.resources);
        } else if (response.type == "room") {
          setRoomData(response.data);
          setPlayers(response.data.players);
        }
      };

      ws.onopen = function (event) {
        console.log("Successfully connected to the websocket server...");
        if (localStorage.getItem("GameRoomID")) {
          var playerNumber = localStorage.getItem("numberPlayer");
          const message = JSON.stringify({
            request: "/map",
            playerNumber: playerNumber,
            GameRoomID: localStorage.getItem("GameRoomID"),
          });
          ws.send(message);
          console.log("data sent");
        } else {
          console.log("GameRoomID is not defined");
        }
      };
    };

    if (localStorage.getItem("GameRoomID")) {
      connectWebSocket();
    } else {
      console.log("WebSocket is not yet open, cannot send message");
    }
  }, []);

  var minZoom = 0.25 / (mapSize / 10);


  console.log(selectedHex)

  return (
    <div className="app">
      <div className="navbar">
        <div className="player-list-container">
          <div className="players">
            <div className="player-container">
              <img
                className="img-ship-players"
                src={Ship1}
                alt="ship-player1"
              />
            </div>
            <p>{playerData.name}</p>
          </div>
          {players.map((player, index) => (
            <div key={index} className="players">
              {player.name ? (
                <>
                  <div className="player-container">
                    <img
                      className="img-ship-players"
                      src={ships[`Ship${player.number}`]}
                      alt={`ship-player${player.number}`}
                    />
                  </div>
                  <p>{player.name}</p>
                </>
              ) : (
                <div className="player-container"></div>
              )}
            </div>
          ))}
        </div>
        <div className="ressources-list-container">
          <div className="ressources-list">
            {Object.entries(ressources).map(([key, value]) => (
              <div className="resources" key={key}>
                <img className="ressource-img" src={ressourceImages[key]} alt={key} />
                <p>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Controls minZoom={minZoom} scale={scale} handleZoom={handleZoom} />
      <HexGrid
        width={"100vw"}
        height={"100vh"}
        viewBox={viewBox}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layout
          size={hexagonSize}
          flat={false}
          spacing={1}
          origin={{ x: -6, y: -6 }}
        >
          {hexagons}
        </Layout>
        <Patterns />
      </HexGrid>

      {/*
      <div className="controlls-container">
        <p>Controlls Container</p>
      </div>
      */}
      {isShipModalOpen && (
        <ShipModal
          ship={selectedShip}
          handleMove={() => moveShip(selectedShip)}
          handleClose={() => setIsShipModalOpen(false)}
        />
      )}
      {isHexModalOpen && (
        <HexModal
          hexa = {selectedHex}
          showModal={true}
          handleModalClose={() => setIsHexModalOpen(false)}
        />
      )}
      {/*
      Commented because of optimisations, the minimap can be done but the map will feel to laggy.
      <MiniMap

      <h2>{hexaType}</h2>
        <button onClick={() => setIsHexModalOpen(false)}>Close</button>

        miniMap={map}
        hexaSize={[hexagonSize.x / 4, hexagonSize.y / 4]}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      ></MiniMap>
      */}
    </div>
  );
}

export default Map;
