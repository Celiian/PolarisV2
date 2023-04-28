import React, { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";

import { HexGrid, Layout } from "react-hexgrid";
import { centerViewBoxAroundCoord } from "./CustomHexUtils";
import db from "../../firebaseConfig";
import { drawMap, prepareMoveShip, handleNextTurn, AddMiner, AddShip, upgradeShip } from "../../utils/utils";

import Controls from "./mapAssets/Controls";
import Patterns from "./mapAssets/Patterns";

import HexModal from "../../components/HexModal/HexModal";
import ChatDrawer from "../../components/Chat/Chat";

import CyberButton from "../../components/cyberButton/CyberButton";
import NavBar from "../../components/NavBar/NavBar";
import BackGroundVideoMap from "../../assets/video/background-map.mp4";
import backgroundSound from "../../assets/sound/ost-map.mp3";

import "./Map.css";

const Map = () => {
  const [map, setMap] = useState([]);
  const [mapVisible, setMapVisible] = useState([]);
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState([]);
  const [turn, setTurn] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [scale, setScale] = useState(0.6);
  const [mapSize, setMapSize] = useState(0);
  const [hexagons, setHexagons] = useState([]);
  const [token, setToken] = useState("");

  const [selectedHex, setSelectedHex] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);

  const [isHexModalOpen, setIsHexModalOpen] = useState(false);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);

  const [pathPossibleHexa, setPathPossibleHexa] = useState([]);
  const [pathHexa, setPathHexa] = useState([]);
  const [shipBuild, setShipBuild] = useState([]);

  const [mouseDown, setMouseDown] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(null);
  const [lastMouseY, setLastMouseY] = useState(null);
  const [first, setFist] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tradeModal, setTradeModal] = useState(false);

  const hexagonSize = { x: 12, y: 12 };

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const viewBoxWidth = screenWidth;
  const viewBoxHeight = screenHeight;
  const viewBoxX = 0 - viewBoxWidth / 2;
  const viewBoxY = 0 - viewBoxHeight / 2;

  const initialViewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
  const [viewBox, setViewBox] = useState(initialViewBox);

  const handleZoom = (event) => {
    const newZoom = event.target.value;
    if (newZoom > 0.11) {
      setScale(newZoom);
    }
  };

  useEffect(() => {
    updateViewBox();
  }, [scale]);

  const updateViewBox = () => {
    const centerX = parseFloat(viewBox.split(" ")[0]) + parseFloat(viewBox.split(" ")[2]) / 2;
    const centerY = parseFloat(viewBox.split(" ")[1]) + parseFloat(viewBox.split(" ")[3]) / 2;

    var newWidth = 100 / scale;
    var newHeight = 100 / scale;
    const newViewBox = `${centerX - newWidth / 2} ${centerY - newHeight / 2} ${newWidth} ${newHeight}`;

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
      const newViewBox = `${newX} ${newY} ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
      setViewBox(newViewBox);
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);
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
        Object.entries(data.map).forEach((hexa, index) => {
          var player_id = hexa[1].fill;
          if (hexa[1].type == "base" && player_id == localStorage.getItem("player_id")) {
            const newViewBox = centerViewBoxAroundCoord(hexa[1].coord.q, hexa[1].coord.r, hexagonSize.x, viewBox);
            setViewBox(newViewBox);
          }
        });
        setFist(false);
      }
      setPlayers(data.players);
      data.players.forEach((player) => {
        if (player.id == localStorage.getItem("player_id")) {
          setPlayer(player);
        }
      });
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
      setSelectedHex,
      setIsHexModalOpen,
      pathPossibleHexa,
      selectedShip,
      setPathHexa,
      pathHexa,
      setPathPossibleHexa,
      token,
      turn,
      player,
      shipBuild,
      setShipBuild,
      setSelectedShip,

      mapVisible,
      setMapVisible
    );
    setHexagons(hexas);
  }, [map, player, viewBox, pathPossibleHexa, pathHexa, shipBuild]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      setSpeed(100);
      const { keyCode } = event;
      let newViewBox = viewBox;
      switch (keyCode) {
        case 37: // Left arrow key
          newViewBox = `${parseFloat(viewBox.split(" ")[0]) - speed} ${viewBox.split(" ")[1]} ${
            viewBox.split(" ")[2]
          } ${viewBox.split(" ")[3]}`;
          break;
        case 38: // Up arrow key
          newViewBox = `${viewBox.split(" ")[0]} ${parseFloat(viewBox.split(" ")[1]) - speed} ${
            viewBox.split(" ")[2]
          } ${viewBox.split(" ")[3]}`;
          break;
        case 39: // Right arrow key
          newViewBox = `${parseFloat(viewBox.split(" ")[0]) + speed} ${viewBox.split(" ")[1]} ${
            viewBox.split(" ")[2]
          } ${viewBox.split(" ")[3]}`;
          break;
        case 40: // Down arrow key
          newViewBox = `${viewBox.split(" ")[0]} ${parseFloat(viewBox.split(" ")[1]) + speed} ${
            viewBox.split(" ")[2]
          } ${viewBox.split(" ")[3]}`;
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

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  var minZoom = 0.02;

  return (
    <>
      <div className="app">
        <div className="video-wrapper">
          <video autoPlay loop muted src={BackGroundVideoMap}></video>
        </div>

        {player && (
          <NavBar
            players={players}
            ressources={player.ressources}
            turn={turn}
            tradeModal={tradeModal}
            setTradeModal={setTradeModal}
            player={player}
            token={token}
          ></NavBar>
        )}
        <button className="btn-drawer" onClick={handleDrawerOpen}>
          Chat
        </button>
        {token && <ChatDrawer open={drawerOpen} onClose={handleDrawerClose} playerData={player} token={token} />}
        <Controls minZoom={minZoom} scale={scale} handleZoom={handleZoom} setScale={setScale} />
        <HexGrid
          width={"100vw"}
          height={"100vh"}
          viewBox={viewBox}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layout size={hexagonSize} flat={false} spacing={1} origin={{ x: -6, y: -6 }}>
            {hexagons}
          </Layout>
          <Patterns />
        </HexGrid>
        <div className="controls-container">
          <CyberButton
            message={"Ready"}
            onClick={() => handleNextTurn(players, token, turn, map, player)}
            toolTip={`Turn ${turn} `}
            style={"black"}
          ></CyberButton>
        </div>
      </div>
      {isHexModalOpen && (
        <HexModal
          hexa={selectedHex}
          showModal={true}
          handleModalClose={() => setIsHexModalOpen(false)}
          button1={selectedHex.button1}
          dataButton1={selectedHex.dataButton1}
          button2={selectedHex.button2}
          dataButton2={selectedHex.dataButton2}
          function1={
            selectedHex.dataButton1.func == "addMiner" &&
            player.ressources.shipEngine >= 2 &&
            player.ressources.shipPart >= 10
              ? () =>
                  AddMiner(
                    selectedHex,
                    player,
                    token,

                    map,
                    setIsHexModalOpen,
                    selectedHex.dataButton1.dataSupp
                  )
              : selectedHex.dataButton1.func == "moveShip"
              ? () => prepareMoveShip(selectedShip, map, setPathPossibleHexa, setIsHexModalOpen)
              : selectedHex.dataButton1.func == "upgradeShip"
              ? () => upgradeShip(selectedShip, player, map, token)
              : () => {}
          }
          function2={
            selectedHex.dataButton2.func == "addShip"
              ? () => AddShip(selectedHex, map, setIsHexModalOpen, setShipBuild)
              : selectedHex.dataButton2.func == "upgradeShip"
              ? () => upgradeShip(selectedShip, player, map, token)
              : () => {}
          }
        />
      )}
    </>
  );
};

export default Map;
