import Hexagon from "../pages/Map/mapAssets/Hexagons";
import { HexUtils } from "react-hexgrid";
import { findPath, memoize, isVisible, getRotationDegree } from "../pages/Map/CustomHexUtils";

function P2(q, r, s) {
  return { q: q, r: r, s: s };
}

const EDGES = 6;
const RADIUS = 65;
const TAU = 2 * Math.PI;
const EDGE_LEN = Math.sin(Math.PI / EDGES) * RADIUS * 2;
const GRID_Y_SPACE = Math.cos(Math.PI / EDGES) * RADIUS * 2;
const GRID_X_SPACE = RADIUS * 2 - EDGE_LEN * 0.5;
const GRID_Y_OFFSET = GRID_Y_SPACE * 0.5;

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
          } else if (randomNumber > 97) {
            type = "asteroid";
            fill = "asteroid";
          } else if (randomNumber > 92) {
            type = "planet";
            const planetRandom = Math.floor(Math.random() * 100) + 1;
            if (planetRandom > 90) {
              fill = "indu";
            } else if (planetRandom > 50) {
              fill = "agri";
            } else if (planetRandom > 30) {
              fill = "atmo";
            } else {
              fill = "mine";
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

        var data = JSON.parse(`{
          "type": "${type}",
          "fill": "${fill}",
          "coord": ${JSON.stringify(P2(x, y, -x - y))},
          "data_players" : ${JSON.stringify(data_players)}
        }`);

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
  setMap
) => {
  var Hexagons = [];
  map.forEach((hexa, index) => {
    if (isVisible(hexa.coord, hexagonSize, viewBox)) {
      var hexagon = null;
      var fill = "";
      var style = "";
      var stroke = "#fff";
      var data_player = {};

      for (let index in hexa.data_players) {
        if (hexa.data_players[index].id == id) {
          data_player = hexa.data_players[index];
        }
      }

      if (data_player.status == "hidden") {
        fill = " ";
        style = " ";
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
                ? () => moveShip(selectedShip, map, pathHexa, setDataInDatabase, setPathPossibleHexa, setPathHexa)
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen)
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
        if (hexa.fill.charAt(0) == id) {
          fill = "";
          style = "";
        }
        hexagon = (
          <Hexagon
            style={style ? style : "planet"}
            stroke={stroke}
            fill={fill ? fill : hexa.type + "/" + hexa.fill}
            hexa={hexa.coord}
            handleClick={
              fill || pathPossibleHexa.includes(index)
                ? () => {}
                : () => handleShipClick(hexa, setSelectedShip, setIsShipModalOpen)
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
                : () => handleHexClick(hexa, map, setSelectedHex, setIsHexModalOpen)
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

const handleHexClick = async (hexa, map, setSelectedHex, setIsHexModalOpen) => {
  var neighbors = HexUtils.neighbors(hexa.coord);
  if (
    map.some((hex) => {
      for (let index in neighbors) {
        if (
          hex.q === neighbors[index].q &&
          hex.r === neighbors[index].r &&
          hex.s === neighbors[index].s &&
          hex.type === "planet"
        ) {
          return true;
        }
      }
    })
  ) {
    console.log("platent");
  } else {
    console.log("fuck");
  }

  var hex = SetHexData(hexa);
  setSelectedHex(hex);
  setIsHexModalOpen(true);
};

export const SetHexData = (hexa) => {
  var desc = "";
  var img = "";
  var style = "";
  var voidSpace = false;
  var name = "";

  if (hexa.fill == "void") {
    name = "Space";
    desc = "Well it's just plain void, what were you expecting ? ";
    img =
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80";
    voidSpace = true;
  }
  if (hexa.fill == "mine") {
    name = "Mining planet";
    desc =
      "Mineral planets are rich in valuable minerals and ores, making them prime locations for mining and resource extraction. However, they may also be home to dangerous environmental conditions and hostile alien species.";
    img = "https://t4.ftcdn.net/jpg/01/82/66/81/360_F_182668101_Lx58VcbiiS03jhaYSDdhuz0zH3CD9pSL.jpg";
    style = "mine";
    voidSpace = false;
  }
  if (hexa.fill == "agri") {
    name = "Agricultural Planet";
    desc =
      "Agricultural planets are characterized by their fertile soil and abundant plant life, making them ideal for farming and food production. These planets are often highly populated and feature bustling cities and agricultural communities.";
    img = "https://4kwallpapers.com/images/walls/thumbs_3t/8758.jpg";
    style = "agri";
    voidSpace = false;
  }
  if (hexa.fill == "atmo") {
    name = "Atmospheric Planet";
    desc =
      "Atmospheric planets in the game are characterized by their thick atmospheres and often feature unique weather patterns, making them challenging to explore but also rich in resources.";
    img =
      "https://w0.peakpx.com/wallpaper/538/645/HD-wallpaper-planet-124d-alien-black-cosmos-darkness-light-neon-space-ufo-violet-thumbnail.jpg";
    style = "atmo";
    voidSpace = false;
  }
  if (hexa.fill == "indu") {
    name = "Industrial Planet";
    desc =
      "Industrial planets are highly developed, with advanced infrastructure and a focus on manufacturing and production. Players can expect to find a wide range of industrial resources and technology on these planets.";
    img = "https://i.pinimg.com/736x/5c/6a/96/5c6a965591f7969cbf5de9684ba0840d.jpg";
    style = "indu";
    voidSpace = false;
  }
  if (hexa.fill == "asteroid") {
    name = "Asteroid field";
    desc =
      "A vast expanse of rocky debris, the asteroid field is a captivating cosmic maze. Suspended in the vacuum of space, these celestial fragments drift and collide, creating a mesmerizing ballet of chaos and beauty.";
    img = "https://t3.ftcdn.net/jpg/02/93/06/66/360_F_293066613_gJaIeEOyHm8Alm7JzF0SICDrvmKxSsrz.jpg";
    style = "indu";
    voidSpace = false;
  }

  return {
    name: name,
    image: img,
    description: desc,
    style: style,
    voidSpace: voidSpace,
    coord: hexa.coord,
    fill: hexa.fill,
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
    distanceMax = 5;
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

const moveShip = async (ship, map, pathHexa, setDataInDatabase, setPathPossibleHexa, setPathHexa) => {
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
    };

    ship.coord = hex.coord;
    const lastMap = updateVisible(ship, newMap);
    await setDataInDatabase(lastMap, "/game_room/" + localStorage.getItem("room_token") + "/map/");
  }
};

const updateVisible = (ship, map) => {
  const distanceMax = ship.type === "base" ? 5 : 5;
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
