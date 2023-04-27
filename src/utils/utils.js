import Hexagon from "../pages/Map/mapAssets/Hexagons";
import { HexUtils } from "react-hexgrid";
import { findPath, memoize, isVisible, getRotationDegree } from "../pages/Map/CustomHexUtils";

function P2(q, r, s) {
  return { q: q, r: r, s: s };
}

const distance = (xa, ya, xb = 0, yb = 0) => {
  let dx = xa - xb;
  let dy = ya - yb;
  let same_sign = dx * dy > 0;
  dx = Math.abs(dx);
  dy = Math.abs(dy);
  if (same_sign) {
    return dx + dy;
  } else {
    return Math.max(dx, dy);
  }
};

export const generate_map = (MAP_SIZE, players) => {
  const map = [];

  var players_spot = [];

  for (let index in players) {
    let randSpotX = Math.floor(Math.random() * ((MAP_SIZE - 1) * 2)) - MAP_SIZE - 2;
    let randSpotY = Math.floor(Math.random() * ((MAP_SIZE - 1) * 2)) - MAP_SIZE - 2;
    var distanceToSun = distance(randSpotX, randSpotY);
    let invalidSpot = randSpotX * randSpotY > 0 && Math.abs(randSpotX) + Math.abs(randSpotY) > MAP_SIZE;

    while (distanceToSun < 5 || invalidSpot) {
      randSpotX = Math.floor(Math.random() * ((MAP_SIZE - 1) * 2)) - MAP_SIZE - 2;
      randSpotY = Math.floor(Math.random() * ((MAP_SIZE - 1) * 2)) - MAP_SIZE - 2;
      distanceToSun = distance(randSpotX, randSpotY);
      invalidSpot = randSpotX * randSpotY > 0 && Math.abs(randSpotX) + Math.abs(randSpotY) > MAP_SIZE;
    }

    players_spot.push({ x: randSpotX, y: randSpotY, id: players[index].id });
  }

  for (let y = MAP_SIZE; y >= -MAP_SIZE - 1; y--) {
    for (let x = -MAP_SIZE; x <= MAP_SIZE + 1; x++) {
      if (x * y > 0 && Math.abs(x) + Math.abs(y) > MAP_SIZE) {
        continue;
      } else {
        let randomNumber = Math.floor(Math.random() * 99) + 1;
        let type = "void";
        let fill = "void";
        let moved = -1;
        let prod = "";
        for (let index in players_spot) {
          if (players_spot[index].x == x && players_spot[index].y == y) {
            fill = players[index].id;
            type = "base";
          }
        }
        if (type != "base") {
          if (x == 0 && y == 0) {
            type = "sun";
            fill = "sun";
          } else if (distance(x, y) < 5) {
          } else if (randomNumber > 98) {
            type = "asteroid";
            fill = "asteroid";
          } else if (randomNumber > 94) {
            type = "planet";
            const planetRandom = Math.floor(Math.random() * 100) + 1;
            if (planetRandom > 80) {
              fill = "indu";
              const prodRandom = Math.floor(Math.random() * 100) + 1;
              if (prodRandom > 50) {
                prod = "shipPart";
              } else {
                prod = "shipEngine";
              }
            } else if (planetRandom > 60) {
              fill = "agri";
              prod = "foodCan";
            } else if (planetRandom > 40) {
              fill = "atmo";
              prod = "water";
            } else {
              fill = "mine";
              const prodRandom = Math.floor(Math.random() * 100) + 1;
              if (prodRandom > 90) {
                prod = "uranium";
              } else if (prodRandom > 60) {
                prod = "crystal";
              } else {
                prod = "ore";
              }
            }
          }
        }
        var data_players = [];
        for (let index in players) {
          for (let indexSpot in players_spot) {
            if (players[index].id == players_spot[indexSpot].id) {
              if (distance(players_spot[indexSpot].x, players_spot[indexSpot].y, x, y) < 10) {
                data_players.push({
                  id: players_spot[indexSpot].id,
                  status: "visible",
                  ship: "base",
                });
              } else {
                data_players.push({
                  id: players_spot[indexSpot].id,
                  status: "hidden",
                  ship: "",
                });
              }
            }
          }
        }
        if (type == "base" || type == "ship") {
          var data = JSON.parse(`{
          "type": "${type}",
          "fill": "${fill}",
          "coord": ${JSON.stringify(P2(x, y, -x - y))},
          "data_players" : ${JSON.stringify(data_players)},
          "moved" : ${moved}
        }`);
        } else if (type == "planet") {
          var data = JSON.parse(`{
          "type": "${type}",
          "fill": "${fill}",
          "prod" : "${prod}",
          "coord": ${JSON.stringify(P2(x, y, -x - y))},
          "data_players" : ${JSON.stringify(data_players)}
        }`);
        } else {
          var data = JSON.parse(`{
          "type": "${type}",
          "fill": "${fill}",
          "coord": ${JSON.stringify(P2(x, y, -x - y))},
          "data_players" : ${JSON.stringify(data_players)}
        }`);
        }
        map.push(data);
      }
    }
  }
  return map;
};

export const drawMap = (
  map,
  hexagonSize,
  viewBox,
  id,
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
  turn,
  player
) => {
  var Hexagons = [];
  map.forEach((hexa, index) => {
    if (isVisible(hexa.coord, hexagonSize, viewBox)) {
      var hexagon = null;
      var fill = "";
      var style = "";
      var stroke = "#fff7";
      var data_player = {};

      for (let index in hexa.data_players) {
        if (hexa.data_players[index].id == id) {
          data_player = hexa.data_players[index];
        }
      }

      if (data_player.status == "hidden") {
        fill = " ";
        style = "hide";
        stroke = "#fff2";
        if (
          hexa.coord.q == 40 ||
          hexa.coord.r == 40 ||
          hexa.coord.q == -40 ||
          hexa.coord.r == -40 ||
          hexa.coord.s == -40 ||
          hexa.coord.s == 40
        ) {
          stroke = "#fff";
        }
      } else if (data_player.status == "discover") {
        style = "discover";
        stroke = "#fff4";
      }

      if (pathPossibleHexa.includes(index)) {
        style = "movable";
      }
      if (pathHexa.includes(index)) {
        style = "path";
      }

      const key = `${hexa.coord.q},${hexa.coord.r},${hexa.coord.s}`;
      if (hexa.fill === "void") {
        hexagon = (
          <Hexagon
            style={style ? style : hexa.fill}
            stroke={stroke}
            fill=""
            hexa={hexa.coord}
            handleClick={
              fill
                ? () => {}
                : pathHexa.includes(index)
                ? () =>
                    moveShip(
                      selectedShip,
                      map,
                      pathHexa,
                      setDataInDatabase,
                      setPathPossibleHexa,
                      setPathHexa,
                      token,
                      turn
                    )
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen, player)
            }
            key={index}
            index={index}
            onMouseEnter={
              pathPossibleHexa.includes(index)
                ? () =>
                    handleHexagonMouseEnter(selectedShip, hexa, map, setPathHexa, pathPossibleHexa, setPathPossibleHexa)
                : () => {}
            }
          ></Hexagon>
        );
      } else if (hexa.type == "base" || hexa.type == "ship" || hexa.type == "miner") {
        if (String(hexa.fill).charAt(0) == id) {
          fill = "";
          style = "";
        } else {
          if (style == "discover") {
            fill = " ";
            style = "discover";
          }
        }
        hexagon = (
          <Hexagon
            style={style ? style : "planet"}
            stroke={stroke}
            fill={fill ? "" : hexa.type + "/" + hexa.fill}
            hexa={hexa.coord}
            handleClick={
              pathPossibleHexa.includes(index)
                ? () => {}
                : hexa.moved < turn
                ? () => handleShipClick(hexa, setSelectedShip, setIsShipModalOpen)
                : () => {}
            }
            key={index}
            index={index}
          ></Hexagon>
        );
      } else {
        var style = "planet";
        hexagon = (
          <Hexagon
            style={style ? style : "planet"}
            stroke={stroke}
            fill={fill ? "" : hexa.fill}
            hexa={hexa.coord}
            handleClick={
              fill || pathPossibleHexa.includes(index)
                ? () => {}
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen, player)
            }
            key={index}
            index={index}
          ></Hexagon>
        );
      }
      Hexagons.push(hexagon);
    }
  });
  return Hexagons;
};

const handleHexClick = async (hexa, map, setSelectedHex, setIsHexModalOpen, player) => {
  var hex = SetHexData(hexa, player, map);
  setSelectedHex(hex);
  setIsHexModalOpen(true);
};

export const SetHexData = (hexa, player, map) => {
  var desc = "";
  var img = "";
  var style = "";
  var name = "";
  var miner = false;
  var dataMiner = { planets_type: [], ressource_prod: [] };
  var button1 = false;
  var dataButton1 = { message: "", toolTip: "", func: "", style: "", dataSupp: null };
  var button2 = false;
  var dataButton2 = {};

  if (hexa.fill == "void") {
    name = "Space";
    desc = "Through the endless expanse of space, light travels on and on, a cosmic dance that never ends.";
    img =
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80";
    for (let index in hexa.data_players) {
      if (hexa.data_players[index].id == player.id) {
        if (hexa.data_players[index].status == "visible") {
          let neighbors = HexUtils.neighbors(hexa.coord);
          map.forEach((hex) => {
            if (hex.type == "planet") {
              neighbors.forEach((neighbor) => {
                if (neighbor.q == hex.coord.q && neighbor.r == hex.coord.r && neighbor.s == hex.coord.s) {
                  dataMiner.planets_type.push(hex.type);
                  dataMiner.ressource_prod.push(hex.prod);
                  button1 = true;
                }
              });
            } else if (hex.type == "miner") {
              neighbors.forEach((neighbor) => {
                if (neighbor.q == hex.coord.q && neighbor.r == hex.coord.r && neighbor.s == hex.coord.s) {
                  miner = true;
                }
              });
            }
          });
        }
      }
    }

    if (miner) {
      button1 = false;
    } else {
      dataButton1.message = "Build Miner";
      dataButton1.toolTip = "ƼᕓӨӨՆ";
      dataButton1.func = "addMiner";
      dataButton1.style = "black small";
      dataButton1.dataSupp = dataMiner;
    }
  }
  if (hexa.fill == "mine") {
    name = "Mining planet";
    desc =
      "Celestial depths behold a cosmic dance, where stardust miners carve new worlds in deft romance; through astral veins they delve, unraveling mysteries grand, unearthing elements that shape the universe's hand.";
    img = "https://t4.ftcdn.net/jpg/01/82/66/81/360_F_182668101_Lx58VcbiiS03jhaYSDdhuz0zH3CD9pSL.jpg";
    style = "mine";
  }
  if (hexa.fill == "agri") {
    name = "Agricultural Planet";
    desc =
      "On these worlds of boundless green, the harvest of a million suns takes root and grows, promising sustenance and bounty to all who call them home.";
    img = "https://4kwallpapers.com/images/walls/thumbs_3t/8758.jpg";
    style = "agri";
  }
  if (hexa.fill == "atmo") {
    name = "Atmospheric Planet";
    desc =
      "In the vast expanse, an atmospheric jewel gleams, where nebulous whispers paint skies with vibrant dreams; as winds entwine in harmonious dance, they birth new tales, a celestial tapestry that endlessly regales.";
    img =
      "https://w0.peakpx.com/wallpaper/538/645/HD-wallpaper-planet-124d-alien-black-cosmos-darkness-light-neon-space-ufo-violet-thumbnail.jpg";
    style = "atmo";
  }
  if (hexa.fill == "indu") {
    name = "Industrial Planet";
    desc =
      "Silent echoes of industry linger, where once steel giants reigned; an abandoned planet's ghostly whispers, a testament to dreams unchained. Yet within its slumber lies the seed of resurgence, awaiting the touch of creators to awaken its dormant emergence.";
    img = "https://i.pinimg.com/736x/5c/6a/96/5c6a965591f7969cbf5de9684ba0840d.jpg";
    style = "indu";
  }
  if (hexa.fill == "asteroid") {
    name = "Asteroid field";
    desc =
      "A vast expanse of rocky debris, the asteroid field is a captivating cosmic maze. Suspended in the vacuum of space, these celestial fragments drift and collide, creating a mesmerizing ballet of chaos and beauty.";
    img = "https://t3.ftcdn.net/jpg/02/93/06/66/360_F_293066613_gJaIeEOyHm8Alm7JzF0SICDrvmKxSsrz.jpg";
    style = "indu";
  }
  if (hexa.fill == "sun") {
    name = "Polaris B (white dwarf)";
    desc =
      "Polaris Ab is a dim and small star, orbiting its brighter companion in a dance of light and gravity. Its presence adds to the mystique and allure of the Polaris system.";
    img = "https://qph.cf2.quoracdn.net/main-qimg-03498708fef0dc7fc62b01745fe31840-lq";
    style = "sun";
  }

  return {
    name: name,
    image: img,
    description: desc,
    style: style,
    coord: hexa.coord,
    fill: hexa.fill,
    button1: button1,
    dataButton1: dataButton1,
    button2: button2,
    dataButton2: dataButton2,
  };
};

const handleShipClick = (hexa, setSelectedShip, setIsShipModalOpen) => {
  setSelectedShip(hexa);
  setIsShipModalOpen(true);
};

export const prepareMoveShip = (ship, map, setPathPossibleHexa) => {
  var pathPossible = [];
  var distanceMax = 0;
  if (ship.type == "base") {
    distanceMax = 2;
  } else if (ship.type == "ship") {
    distanceMax = 5;
  }
  map.forEach((hexa, index) => {
    var actualDistance = HexUtils.distance(hexa.coord, ship.coord);
    if (actualDistance <= distanceMax) {
      pathPossible.push(index);
    }
  });
  setPathPossibleHexa(pathPossible);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const moveShip = async (ship, map, pathHexa, setDataInDatabase, setPathPossibleHexa, setPathHexa, token, turn) => {
  const shipIndex = map.findIndex(
    (hex) => hex.coord.q === ship.coord.q && hex.coord.r === ship.coord.r && hex.coord.s === ship.coord.s
  );
  const newMap = [...map];
  setPathHexa([]);
  setPathPossibleHexa([]);
  for (let i = 0; i < pathHexa.length; i++) {
    const hexIndex = pathHexa[i];
    const hex = newMap[hexIndex];

    newMap[hexIndex] = {
      ...ship,
      fill: hex.fill,
      type: hex.type,
      coord: ship.coord,
    };
    var rotate = getRotationDegree(ship.coord, hex.coord);
    newMap[shipIndex] = {
      ...hex,
      fill: ship.fill.charAt(0) + "/" + rotate,
      type: ship.type,
      coord: hex.coord,
      moved: turn,
    };

    ship.coord = hex.coord;
    const lastMap = updateVisible(ship, newMap);
    await setDataInDatabase(lastMap, "/game_room/" + token + "/map/");
  }
};

const updateVisible = (ship, map) => {
  const distanceMax = ship.type === "base" ? 10 : 5;
  const newMap = map.map((hex) => {
    const actualDistance = HexUtils.distance(hex.coord, ship.coord);
    if (actualDistance <= distanceMax) {
      const newDataPlayers = hex.data_players.map((player) => {
        if (parseInt(player.id) === parseInt(localStorage.getItem("player_id"))) {
          return { ...player, status: "visible", ship: ship.type };
        } else {
          return player;
        }
      });
      return { ...hex, data_players: newDataPlayers };
    } else {
      const newDataPlayers = hex.data_players.map((player) => {
        if (player.status == "visible" && String(player.ship) == String(ship.type)) {
          return { ...player, status: "discover" };
        } else {
          return player;
        }
      });
      return { ...hex, data_players: newDataPlayers };
    }
  });
  return newMap;
};

const handleHexagonMouseEnter = (ship, hexa, map, setPathHexa, pathPossibleHexa, setPathPossibleHexa) => {
  const mapCoordToIndex = {};
  map.forEach((hex, index) => {
    mapCoordToIndex[`${hex.coord.q},${hex.coord.r},${hex.coord.s}`] = index;
  });

  const findPathMemoized = memoize(findPath);

  const path = findPathMemoized(ship.coord, hexa.coord, map) || [];
  const pathIndexes = path.slice(1).map((hexaPath) => mapCoordToIndex[`${hexaPath.q},${hexaPath.r},${hexaPath.s}`]);
  var newPathPossibleHexa = pathPossibleHexa;

  setPathPossibleHexa(newPathPossibleHexa);
  setPathHexa(pathIndexes);
};

export const handleNextTurn = async (players, setDataInDatabase, token, turn, map, actualPlayer) => {
  console.log("clicked");
  var allReady = true;
  players.forEach((player) => {
    if (player.ready == false && player.id != actualPlayer.id) {
      allReady = false;
    }
  });

  var newPlayers = [];
  if (!allReady) {
    newPlayers = players.map((player) => {
      if (player.id === actualPlayer.id) {
        return {
          ...player,
          ready: true,
        };
      }
      return player;
    });
  } else {
    var ressource_players = {};
    players.forEach((player, index) => {
      var newRessources = player.ressources;
      map.forEach((hexa) => {
        if (hexa.type == "miner" && hexa.fill == player.id) {
          hexa.ressources.forEach((rss) => {
            newRessources[rss] = newRessources[rss] + 10 * hexa.level;
          });
        }
      });
      ressource_players[index] = newRessources;
    });

    console.log(ressource_players);

    newPlayers = players.map((player) => {
      return {
        ...player,
        ready: false,
      };
    });
    await setDataInDatabase(turn + 1, "/game_room/" + token + "/turn/");
  }

  await setDataInDatabase(newPlayers, "/game_room/" + token + "/players/");
};

export const AddMiner = async (hexa, player, token, setDataInDatabase, map, setIsHexModalOpen, dataSupp) => {
  setIsHexModalOpen(false);

  const newHexa = {
    coord: hexa.coord,
    type: "miner",
    fill: player.id,
    planets: dataSupp.planets_type,
    ressources: dataSupp.ressource_prod,
    level: 1,
  };
  var newMap = updateHexagon(map, hexa, newHexa);
  await setDataInDatabase(newMap, "/game_room/" + token + "/map/");
};

const updateHexagon = (mapData, hexa, newProperties) => {
  const newMap = mapData.map((hex) => hex);

  const indexToUpdate = newMap.findIndex(
    (obj) => obj && obj.coord.q == hexa.coord.q && obj.coord.r == hexa.coord.r && obj.coord.s == hexa.coord.s
  );

  if (indexToUpdate === -1) {
    return mapData;
  }

  const objToUpdate = newMap[indexToUpdate];

  for (const prop in newProperties) {
    objToUpdate[prop] = newProperties[prop];
  }

  const updatedList = [...mapData];
  updatedList[indexToUpdate] = objToUpdate;

  return updatedList;
};
