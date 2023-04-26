// CustomHexUtils.js
import { HexUtils, Hex } from "react-hexgrid";
import TinyQueue from "tinyqueue";

export const memoize = (func) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};
const priorityQueueComparator = (a, b) => a.f - b.f;

export const findPath = memoize((hexStart, hexEnd, map) => {
  const openSet = new TinyQueue([{ hex: hexStart, f: 0 }], priorityQueueComparator);
  const closedSet = [];

  const cameFrom = {};

  const gScore = {};
  gScore[`${hexStart.q},${hexStart.r},${hexStart.s}`] = 0;

  const fScore = {};
  fScore[`${hexStart.q},${hexStart.r},${hexStart.s}`] = HexUtils.distance(hexStart, hexEnd);

  while (openSet.length > 0) {
    const current = openSet.pop().hex;

    if (current.q === hexEnd.q && current.r === hexEnd.r && current.s === hexEnd.s) {
      const path = [current];
      while (cameFrom[`${path[0].q},${path[0].r},${path[0].s}`]) {
        path.unshift(cameFrom[`${path[0].q},${path[0].r},${path[0].s}`]);
      }
      return path;
    }

    closedSet.push(current);

    const neighbors = HexUtils.neighbors(current);
    neighbors.forEach((neighbor) => {
      if (closedSet.some((hex) => hex.q === neighbor.q && hex.r === neighbor.r && hex.s === neighbor.s)) {
        return;
      }

      for (let i = 0; i < map.length; i++) {
        const hex = map[i];
        if (hex.coord.q === neighbor.q && hex.coord.r === neighbor.r && hex.coord.s === neighbor.s) {
          if (
            hex.type == "planet" ||
            hex.type == "base" ||
            hex.type == "ship" ||
            hex.type == "miner" ||
            hex.type == "asteroids"
          ) {
            return;
          }
        }
      }

      const tentativeGScore = gScore[`${current.q},${current.r},${current.s}`] + 1;

      if (
        !openSet.data.some(
          (item) => item.hex.q === neighbor.q && item.hex.r === neighbor.r && item.hex.s === neighbor.s
        )
      ) {
        openSet.push({ hex: neighbor, f: tentativeGScore + HexUtils.distance(neighbor, hexEnd) });
      } else if (tentativeGScore >= gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`]) {
        return;
      }

      cameFrom[`${neighbor.q},${neighbor.r},${neighbor.s}`] = current;
      gScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] = tentativeGScore;
      fScore[`${neighbor.q},${neighbor.r},${neighbor.s}`] = tentativeGScore + HexUtils.distance(neighbor, hexEnd);
    });
  }

  return null;
});

export const hexToPixel = (q, r, size) => {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);

  return { x, y };
};

export const isVisible = (hexa, hexagonSize, viewBox) => {
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

export const getRotationDegree = (hex1, hex2) => {
  const directionVectors = {
    "1,-1,0": "45",
    "0,-1,1": "-45",
    "1,0,-1": "90",
    "-1,0,1": "-90",
    "-1,1,0": "-135",
    "0,1,-1": "135",
  };

  const hexDifference = new Hex(hex2.q - hex1.q, hex2.r - hex1.r, hex2.s - hex1.s);
  const hexDifferenceKey = `${hexDifference.q},${hexDifference.r},${hexDifference.s}`;
  for (const [key, value] of Object.entries(directionVectors)) {
    if (key === hexDifferenceKey) {
      return parseInt(value, 10);
    }
  }

  // Return -1 if the hexagons are not neighbors
  return -1;
};

export const centerViewBoxAroundCoord = (q, r, hexSize, currentViewBox) => {
  const { x, y } = hexToPixel(q, r, hexSize);

  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = currentViewBox.split(" ").map(parseFloat);

  const newViewBoxX = x - viewBoxWidth / 2;
  const newViewBoxY = y - viewBoxHeight / 2;

  const newViewBox = `${newViewBoxX} ${newViewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;
  return newViewBox;
};
