import Hexagon from "../pages/Map/mapAssets/Hexagons";
import { HexUtils } from "react-hexgrid";
import { ref, set, update } from "firebase/database";
import { findPath, memoize, isVisible, getRotationDegree } from "../pages/Map/CustomHexUtils";
import db from "../firebaseConfig";

const setDataInDatabase = async (data, path) => {
  const databaseRef = ref(db, path);
  try {
    await set(databaseRef, data);
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

const setMapInDb = async (data, path) => {
  const databaseRef = ref(db, path);
  try {
    const updates = {};
    data.forEach((doc) => {
      const docPath = `${doc.coord.q}_${doc.coord.r}_${doc.coord.s}`;
      updates[docPath] = doc;
    });
    await update(databaseRef, updates);
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

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
                  shipId: -2,
                });
              } else {
                data_players.push({
                  id: players_spot[indexSpot].id,
                  status: "hidden",
                  ship: "",
                  shipId: -1,
                });
              }
            }
          }
        }
        if (type == "base") {
          var data = JSON.parse(`{
          "type": "${type}",
          "fill": "${fill}",
          "coord": ${JSON.stringify(P2(x, y, -x - y))},
          "data_players" : ${JSON.stringify(data_players)},
          "moved" : ${moved},
          "level" : 1,
          "id" : -2
        }`);
        } else if (type == "planet" || type == "sun") {
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
          "data_players" : ${JSON.stringify(data_players)},
          "id" : -1
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
  setSelectedShip
) => {
  var Hexagons = [];
  Object.entries(map).forEach(([index, hexa]) => {
    if (isVisible(hexa.coord, hexagonSize, viewBox)) {
      var hexagon = null;
      var fill = "";
      var style = "";
      var stroke = "#fff9";
      var data_player = (data_player = hexa.data_players[player.id - 1]);

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
      } else if (data_player.status == "discovered") {
        style = "discovered";
        stroke = "#fff2";
      }

      if (pathPossibleHexa.includes(index)) {
        style = "movable";
      }
      if (pathHexa.includes(index)) {
        style = "path";
      }

      if (shipBuild.includes(index)) {
        style = "buildable";
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

                      setPathPossibleHexa,
                      setPathHexa,
                      token,
                      turn,
                      setShipBuild,
                      player
                    )
                : shipBuild.includes(index)
                ? () => BuildShip(hexa, player, token, map, setShipBuild, shipBuild)
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen, player, setSelectedShip, turn)
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
        if (String(hexa.fill).charAt(0) == player.id) {
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
            handleClick={() =>
              handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen, player, setSelectedShip, turn)
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
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen, player, turn)
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

const handleHexClick = async (hexa, map, setSelectedHex, setIsHexModalOpen, player, setSelectedShip, turn) => {
  console.log(hexa);
  var hex = SetHexData(hexa, player, map, setSelectedShip, turn);

  setSelectedHex(hex);
  setIsHexModalOpen(true);
};

export const SetHexData = (hexa, player, map, setSelectedShip, turn) => {
  var desc = "";
  var img = "";
  var style = "";
  var name = "";
  var miner = false;
  var dataMiner = { planets_type: [], ressource_prod: [] };
  var button1 = false;
  var dataButton1 = {
    message: "",
    toolTip: "",
    func: "",
    style: "",
    dataSupp: null,
  };
  var button2 = false;
  var dataButton2 = { message: "", toolTip: "", func: "", style: "", dataSupp: null };

  if (hexa.type == "base") {
    setSelectedShip(hexa);
    name = "Mother Ship";
    desc =
      "Despite its size, the Mother Ship boasts a sleek and streamlined design, allowing it to navigate even the most challenging environments and protect its inhabitants. Thanks to its advanced manufacturing facilities, the motherShip can also produce smaller spacecraft such as exploration ships, requiring 20 ship parts and 5 ship engines to construct. ";
    img = "https://wallpapercrafter.com/desktop1/540220-action-battlestar-fighting-futuristic-galactica.jpg";
    style = "indu";
    if (String(hexa.fill).charAt(0) == player.id) {
      if (hexa.moved < turn) {
        button1 = true;
      }
      button2 = true;
      dataButton1 = { message: "Move", toolTip: "ƼᕓӨӨՆ", func: "moveShip", style: "black small", dataSupp: null };
      var btnMsg = "";
      var func = "";
      if (player.ressources.shipEngine < 5 || player.ressources.shipPart < 20) {
        btnMsg = "You don't have enought ressources";
      } else {
        btnMsg = "Build Ship";
        func = "addShip";
      }
      dataButton2 = { message: btnMsg, toolTip: "ӨӨƼᕓՆ", func: func, style: "black small", dataSupp: null };
    }
  } else if (hexa.type == "miner") {
    setSelectedShip(hexa);
    name = "Mining Ship";
    desc =
      "Anchored in the void, the mining ship awaits, harvesting bounties as celestial gifts from planetary mates; a sentinel of progress, extracting riches from the skies, transforming cosmic wealth into humanity's prize. If you want to upgrade it it will cost you :" +
      2 * (hexa.level + 1) +
      " ship engines and : " +
      10 * (hexa.level + 1) +
      " ship parts.";
    img = "https://pbs.twimg.com/media/Dabg7QvXcAABFRu.jpg:large";
    style = "indu";
    if (String(hexa.fill).charAt(0) == player.id) {
      button1 = true;
      var btnMsg = "Upgrade Ship";
      var func = "upgradeShip";
      if (player.ressources.shipEngine < 2 * (hexa.level + 1) || player.ressources.shipPart < 10 * (hexa.level + 1)) {
        btnMsg = "You don't have enought ressources";
        func = "";
      }

      dataButton1 = {
        message: btnMsg,
        toolTip: "ӨӨƼᕓՆ",
        func: func,
        style: "black small",
        dataSupp: null,
      };
    }
  } else if (hexa.type == "ship") {
    setSelectedShip(hexa);
    name = "Exploration Ship";
    desc =
      "Equipped with cutting-edge propulsion systems and state-of-the-art scientific instruments, the space exploration ship represents humanity's unwavering commitment to unlocking the secrets of the universe. As it voyages through the cosmos, it offers a glimpse into the boundless possibilities of space exploration and the limitless potential of human ingenuity. If you want to upgrade it it will cost you :" +
      5 * (hexa.level + 1) +
      " ship engines and : " +
      20 * (hexa.level + 1) +
      " ship parts.";
    img =
      "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e61c74a7-0e3e-40be-8a70-e05a01fef9f7/dct211a-d481ce86-8ddf-40d7-868f-70e8a3bb1640.jpg/v1/fill/w_1210,h_660,q_75,strp/star_wars_terran_scout_ship_by_scifidan96_dct211a-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjYwIiwicGF0aCI6IlwvZlwvZTYxYzc0YTctMGUzZS00MGJlLThhNzAtZTA1YTAxZmVmOWY3XC9kY3QyMTFhLWQ0ODFjZTg2LThkZGYtNDBkNy04NjhmLTcwZThhM2JiMTY0MC5qcGciLCJ3aWR0aCI6Ijw9MTIxMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.cm-EAnU0hLKNFZhZ99vV53vEuYdUEq7jn2u8XVbqZtc";
    style = "large";

    if (String(hexa.fill).charAt(0) == player.id) {
      if (hexa.moved < turn) {
        button1 = true;
        dataButton1 = { message: "Move", toolTip: "ƼᕓӨӨՆ", func: "moveShip", style: "black small", dataSupp: null };
      }
      button2 = true;
      var btnMsg = "Upgrade Ship";
      var func = "upgradeShip";
      if (player.ressources.shipEngine < 5 * (hexa.level + 1) || player.ressources.shipPart < 20 * (hexa.level + 1)) {
        btnMsg = "You don't have enought ressources";
        func = "";
      }
      dataButton2 = {
        message: btnMsg,
        toolTip: "ӨӨƼᕓՆ",
        func: func,
        style: "black small",
        dataSupp: null,
      };
    }
  } else if (hexa.fill == "void") {
    name = "Space";
    desc = "Through the endless expanse of space, light travels on and on, a cosmic dance that never ends.";
    img =
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80";
    for (let index in hexa.data_players) {
      if (hexa.data_players[index].id == player.id) {
        if (hexa.data_players[index].status == "visible") {
          let neighbors = HexUtils.neighbors(hexa.coord);
          Object.entries(map).forEach(([index, hex]) => {
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
    } else if (button1 == true) {
      if (player.ressources.shipEngine < 2 || player.ressources.shipPart < 10) {
        dataButton1.message = "You don't have enought ressources";
      } else {
        dataButton1.message = "Build Miner";
      }
      dataButton1.toolTip = "ƼᕓӨӨՆ";
      dataButton1.func = "addMiner";
      dataButton1.style = "black small";
      dataButton1.dataSupp = dataMiner;
      desc =
        "With a miner ship at your disposal, the rich resources of nearby planets are yours for the taking. Add this essential vessel to your fleet to extract valuable materials and propel your civilization towards prosperity and power. To build a miner ship you will need 10 Ship Part and 2 Ship Engine";
    }
    style = "large";
  } else if (hexa.fill == "mine") {
    name = "Mining planet";
    desc =
      "Celestial depths behold a cosmic dance, where stardust miners carve new worlds in deft romance; through astral veins they delve, unraveling mysteries grand, unearthing elements that shape the universe's hand.";
    img = "https://t4.ftcdn.net/jpg/01/82/66/81/360_F_182668101_Lx58VcbiiS03jhaYSDdhuz0zH3CD9pSL.jpg";
    style = "mine";
  } else if (hexa.fill == "agri") {
    name = "Agricultural Planet";
    desc =
      "On these worlds of boundless green, the harvest of a million suns takes root and grows, promising sustenance and bounty to all who call them home.";
    img = "https://4kwallpapers.com/images/walls/thumbs_3t/8758.jpg";
    style = "agri";
  } else if (hexa.fill == "atmo") {
    name = "Atmospheric Planet";
    desc =
      "In the vast expanse, an atmospheric jewel gleams, where nebulous whispers paint skies with vibrant dreams; as winds entwine in harmonious dance, they birth new tales, a celestial tapestry that endlessly regales.";
    img =
      "https://w0.peakpx.com/wallpaper/538/645/HD-wallpaper-planet-124d-alien-black-cosmos-darkness-light-neon-space-ufo-violet-thumbnail.jpg";
    style = "atmo";
  } else if (hexa.fill == "indu") {
    name = "Industrial Planet";
    desc =
      "Silent echoes of industry linger, where once steel giants reigned; an abandoned planet's ghostly whispers, a testament to dreams unchained. Yet within its slumber lies the seed of resurgence, awaiting the touch of creators to awaken its dormant emergence.";
    img = "https://i.pinimg.com/736x/5c/6a/96/5c6a965591f7969cbf5de9684ba0840d.jpg";
    style = "indu";
  } else if (hexa.fill == "asteroid") {
    name = "Asteroid field";
    desc =
      "A vast expanse of rocky debris, the asteroid field is a captivating cosmic maze. Suspended in the vacuum of space, these celestial fragments drift and collide, creating a mesmerizing ballet of chaos and beauty.";
    img = "https://t3.ftcdn.net/jpg/02/93/06/66/360_F_293066613_gJaIeEOyHm8Alm7JzF0SICDrvmKxSsrz.jpg";
    style = "indu";
  } else if (hexa.fill == "sun") {
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
    fill: style || hexa.fill,
    button1: button1,
    dataButton1: dataButton1,
    button2: button2,
    dataButton2: dataButton2,
    data_players: hexa.data_players,
  };
};

export const prepareMoveShip = (ship, map, setPathPossibleHexa, setIsHexModalOpen) => {
  var pathPossible = [];
  var distanceMax = 0;
  if (ship.type == "base") {
    distanceMax = 2;
  } else if (ship.type == "ship") {
    distanceMax = 3 + 2 * ship.level;
  }
  Object.entries(map).forEach(([index, hexa]) => {
    var actualDistance = HexUtils.distance(hexa.coord, ship.coord);
    if (actualDistance <= distanceMax) {
    }
    if (actualDistance <= distanceMax) {
      pathPossible.push(index);
    }
  });

  setPathPossibleHexa(pathPossible);
  setIsHexModalOpen(false);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const moveShip = async (ship, map, pathHexa, setPathPossibleHexa, setPathHexa, token, turn, player) => {
  var shipKey = `${ship.coord.q}_${ship.coord.r}_${ship.coord.s}`;

  setPathHexa([]);
  setPathPossibleHexa([]);
  var newMap = { ...map };

  for (let i = 0; i < pathHexa.length; i++) {
    let hexaListToUpdate = [];
    let hexIndex = pathHexa[i];
    var newMapLoop = { ...newMap };
    let hex = map[hexIndex];

    newMapLoop[shipKey] = {
      coord: ship.coord,
      fill: "void",
      type: "void",
      data_players: hex.data_players,
    };

    var rotate = getRotationDegree(ship.coord, hex.coord);
    newMapLoop[hexIndex] = {
      ...hex,
      fill: String(ship.fill).charAt(0) + "/" + rotate,
      type: ship.type,
      moved: turn,
      level: ship.level,
      id: ship.id,
    };

    hexaListToUpdate.push(newMapLoop[hexIndex], newMapLoop[shipKey]);
    ship.coord = hex.coord;

    const modified = updateVisible(ship, newMapLoop, player);
    modified.forEach((key) => {
      hexaListToUpdate.push(newMapLoop[key]);
    });

    await setMapInDb(hexaListToUpdate, `/game_room/${token}/map/`);
  }
};

const updateVisible = (ship, map) => {
  const player_id = parseInt(localStorage.getItem("player_id")) - 1;
  var distanceMax = 0;
  if (ship.type === "base") {
    distanceMax = 10;
  } else {
    distanceMax = 3 + 2 * ship.level;
  }
  var modified = [];
  Object.entries(map).forEach(([key, hex]) => {
    const actualDistance = HexUtils.distance(hex.coord, ship.coord);
    var player_data = hex.data_players[player_id];

    if (actualDistance <= distanceMax) {
      if (player_data.ship != "miner") {
        if (player_data.status != "visible") {
          modified.push(key);
          player_data.ship = ship.type;
          player_data.shipId = ship.id;
          player_data.status = "visible";
        } else if (player_data.shipId == -1) {
          modified.push(key);
          player_data.ship = ship.type;
          player_data.shipId = ship.id;
          player_data.status = "visible";
        }
      }
    } else {
      if (player_data.ship != "miner" && player_data.status == "visible") {
        if (player_data.ship == ship.type && player_data.shipId == ship.id) {
          modified.push(key);
          player_data.status = "discovered";
          player_data.ship = "";
          player_data.shipId = -1;
        }
      }
    }
  });
  return modified;
};

const handleHexagonMouseEnter = (ship, hexa, map, setPathHexa, pathPossibleHexa, setPathPossibleHexa) => {
  const mapCoordToIndex = {};
  Object.entries(map).forEach(([index, hex]) => {
    mapCoordToIndex[`${hex.coord.q},${hex.coord.r},${hex.coord.s}`] = index;
  });

  const findPathMemoized = memoize(findPath);

  const path = findPathMemoized(ship.coord, hexa.coord, map) || [];
  const pathIndexes = path.slice(1).map((hexaPath) => mapCoordToIndex[`${hexaPath.q},${hexaPath.r},${hexaPath.s}`]);
  var newPathPossibleHexa = pathPossibleHexa;

  setPathPossibleHexa(newPathPossibleHexa);
  setPathHexa(pathIndexes);
};

export const handleNextTurn = async (players, token, turn, map, actualPlayer) => {
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
      Object.entries(map).forEach(([index, hexa]) => {
        if (hexa.type == "miner" && hexa.fill == player.id) {
          hexa.ressources.forEach((rss) => {
            newRessources[rss] = newRessources[rss] + 10 * hexa.level;
          });
        }
      });
      ressource_players[index] = newRessources;
    });

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

export const AddMiner = async (
  hexa,
  player,
  token,

  map,
  setIsHexModalOpen,
  dataSupp
) => {
  console.log(hexa);
  setIsHexModalOpen(false);
  var newData = [];
  player.ressources.shipEngine -= 2;
  player.ressources.shipPart -= 10;
  player.points += 1;
  await setPlayerData(player, token);

  var hexaKey = `${hexa.coord.q}_${hexa.coord.r}_${hexa.coord.s}`;

  map[hexaKey] = {
    coord: hexa.coord,
    type: "miner",
    fill: player.id,
    planets: dataSupp.planets_type,
    ressources: dataSupp.ressource_prod,
    level: 1,
    id: 0,
    data_players: hexa.data_players,
  };
  newData.push(map[hexaKey]);
  console.log(map[hexaKey]);
  var modified = updateVisible(map[hexaKey], map, player);
  modified.forEach((key) => {
    newData.push(map[key]);
  });

  await setMapInDb(newData, "/game_room/" + token + "/map/");
};

export const AddShip = async (hexa, map, setIsHexModalOpen, setShipBuild) => {
  setIsHexModalOpen(false);

  var shipBuild = [];
  var neighbors = HexUtils.neighbors(hexa.coord);
  Object.entries(map).forEach(([index, hexa]) => {
    neighbors.forEach((neighbor) => {
      if (
        neighbor.q == hexa.coord.q &&
        neighbor.r == hexa.coord.r &&
        neighbor.s == hexa.coord.s &&
        hexa.type == "void"
      ) {
        shipBuild.push(index);
      }
    });
  });
  setShipBuild(shipBuild);
};

export const BuildShip = async (hexa, player, token, map, setShipBuild, shipBuild) => {
  player.ressources.shipEngine -= 5;
  player.ressources.shipPart -= 20;
  player.points += 1;
  await setPlayerData(player, token);

  setShipBuild([]);
  shipBuild = [];

  const newHexa = {
    coord: hexa.coord,
    type: "ship",
    fill: player.id,
    moved: -1,
    level: 1,
    id: player.ship,
  };

  player.ship += 1;
  var newMap = updateHexagon(map, hexa, newHexa);
  await setDataInDatabase(newMap, "/game_room/" + token + "/map/");
  await setPlayerData(player, token);
};

export const setPlayerData = async (player, token) => {
  await setDataInDatabase(player, "/game_room/" + token + "/players/" + (player.id - 1));
};

const updateHexagon = (mapData, hexa, newProperties) => {
  const newMap = mapData;

  const indexToUpdate = `${hexa.coord.q}_${hexa.coord.r}_${hexa.coord.s}`;

  const objToUpdate = newMap[indexToUpdate];

  for (const prop in newProperties) {
    objToUpdate[prop] = newProperties[prop];
  }

  mapData[indexToUpdate] = objToUpdate;

  return mapData;
};

export const SendMessage = async (message, tokenPlayer) => {
  await setDataInDatabase(message, "/game_room/" + tokenPlayer + "/chat/");
};

export const upgradeShip = async (ship, player, map, token) => {
  var newData = [];

  const shipKey = `${ship.coord.q}_${ship.coord.r}_${ship.coord.s}`;

  if (map[shipKey].type == "miner") {
    player.ressources.shipPart -= 10 * (map[shipKey].level + 1);
    player.ressources.shipEngine -= 2 * (map[shipKey].level + 1);
  } else {
    player.ressources.shipPart -= 20 * (map[shipKey].level + 1);
    player.ressources.shipEngine -= 5 * (map[shipKey].level + 1);
  }
  map[shipKey].level += 1;

  newData.push(map[shipKey]);

  const modified = updateVisible(ship, map, player);
  modified.forEach((key) => {
    newData.push(map[key]);
  });

  await setMapInDb(newData, "/game_room/" + token + "/map/");
  await setPlayerData(player, token);
};
