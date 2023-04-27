import React, { useState, useEffect } from "react";

import { Hex, HexGrid, HexUtils, Layout } from "react-hexgrid";
import { centerViewBoxAroundCoord } from "./CustomHexUtils";
import { ref, onValue, off, set } from "firebase/database";
import db from "../../firebaseConfig";
import { drawMap, prepareMoveShip, handleNextTurn } from "../../utils/utils";

import Controls from "./mapAssets/Controls";
import Patterns from "./mapAssets/Patterns";

import HexModal from "../../components/HexModal/HexModal";
import ShipModal from "../../components/ShipModal/ShipModal";

import CyberButton from "../../components/cyberButton/CyberButton";
import NavBar from "../../components/NavBar/NavBar";
import BackGroundVideoMap from "../../assets/video/background-map.mp4";
import backgroundSound from "../../assets/sound/ost-map.mp3";

import "./Map.css";

const Map = () => {
  const [map, setMap] = useState([]);
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [scale, setScale] = useState(0.3);
  const [mapSize, setMapSize] = useState(0);
  const [hexagons, setHexagons] = useState([]);
  const [token, setToken] = useState("");

  const [selectedHex, setSelectedHex] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);

  const [isHexModalOpen, setIsHexModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);

  const [pathPossibleHexa, setPathPossibleHexa] = useState([]);
  const [pathHexa, setPathHexa] = useState([]);

  const [mouseDown, setMouseDown] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(null);
  const [lastMouseY, setLastMouseY] = useState(null);
  const [first, setFist] = useState(true);
  const hexagonSize = { x: 12, y: 12 };

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const viewBoxWidth = screenWidth;
  const viewBoxHeight = screenHeight;
  const viewBoxX = 0 - viewBoxWidth / 2;
  const viewBoxY = 0 - viewBoxHeight / 2;

  const initialViewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
  const [viewBox, setViewBox] = useState(initialViewBox);

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

  useEffect(() => {
    const audio = new Audio(backgroundSound);

    const playAudio = () => {
      if (audio.duration > 0 && !audio.paused) {
        return;
      }
      audio.loop = true;
      audio.play();
    };

    document.addEventListener("click", playAudio);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("room_token");
    const databaseRef = ref(db, "/game_room/" + token);
    setToken(token);
    onValue(databaseRef, (snapshot) => {
      var data = snapshot.val();
      setMap(data.map);
      if (first) {
        data.map.forEach((hexa, index) => {
          if (
            hexa.type == "base" &&
            hexa.fill == localStorage.getItem("player_id")
          ) {
            const newViewBox = centerViewBoxAroundCoord(
              hexa.coord.q,
              hexa.coord.r,
              hexagonSize.x,
              viewBox
            );
            setViewBox(newViewBox);
          }
        });
        setFist(false);
      }
      setPlayers(data.players);
      setTurn(data.turn);
    });

    return () => {
      off(databaseRef);
    };
  }, []);

  useEffect(() => {
    var hexas = drawMap(
      map,
      hexagonSize,
      viewBox,
      localStorage.getItem("player_id"),
      setSelectedHex,
      setIsHexModalOpen,
      setSelectedShip,
      setIsShipModalOpen,
      pathPossibleHexa,
      selectedShip,
      setPathHexa,
      pathHexa,
      setPathPossibleHexa,
      setDataInDatabase,
      token,
      turn
    );
    setHexagons(hexas);
  }, [map, viewBox, pathPossibleHexa, pathHexa]);

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

  const setDataInDatabase = async (data, path) => {
    const databaseRef = ref(db, path);
    try {
      await set(databaseRef, data);
      console.log("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  };

  var minZoom = 0.25 / (mapSize / 10);

  var ressources = {
    Water: 10,
    FoodCan: 10,
    ShipEngine: 10,
    Coins: 10,
    Uranium: 10,
    Iron: 10,
    Crystal: 10,
  };

  return (
    <>
      <div className="app">
        <div className="video-wrapper">
          <video autoPlay loop muted src={BackGroundVideoMap}></video>
        </div>
        <NavBar players={players} ressources={ressources}></NavBar>

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
        <div className="controls-container">
          <CyberButton
            message={"Ready"}
            onClick={() =>
              handleNextTurn(players, setDataInDatabase, token, turn)
            }
            turn={`Turn ${turn} `}
            color={"black"}
          ></CyberButton>
        </div>
      </div>
      {isShipModalOpen && selectedShip ? (
        <ShipModal
          ship={selectedShip}
          handleMove={() => {
            prepareMoveShip(selectedShip, map, setPathPossibleHexa);
          }}
          handleClose={() => {
            setIsShipModalOpen(false);
          }}
          handleBuild={() => {}}
        />
      ) : (
        <></>
      )}
      {isHexModalOpen && (
        <HexModal
          hexa={selectedHex}
          showModal={true}
          handleModalClose={() => setIsHexModalOpen(false)}
          handleAddMiner={() => {}}
        />
      )}
    </>
  );
};

export default Map;
