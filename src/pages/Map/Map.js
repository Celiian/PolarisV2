import React, { useState, useEffect } from "react";
import { HexGrid, HexUtils, Layout } from "react-hexgrid";
import axios from "axios";
import "./Map.css";
import Hexagon from "./Hexagons";
import Controls from "./Controls";
import Patterns from "./Patterns";
import HexModal from "./HexModal";
//import MiniMap from "./MiniMap";
//import styled from "styled-components";

function Map() {
  const [hexagonFills, setHexagonFills] = useState({});
  const [hexagonClassNames, setHexagonClassNames] = useState({});
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
      const newViewBox = `${newX} ${newY} ${viewBox.split(" ")[2]} ${viewBox.split(" ")[3]}`;
      setViewBox(newViewBox);
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  const handleZoom = (event) => {
    const newZoom = event.target.value;
    setScale(newZoom);
  };

  const handleHexClick = (hexa, index) => {
    console.log(HexUtils.distance(hexa, { q: 0, r: 0, s: 0 }));
    var desc = "";
    var img = "";
    if (hexa.fill == "void") {
      desc = "Well it's just plain void, what were you expecting ? ";
      img =
        "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80";
    }

    const hex = { name: hexa.fill, image: img, description: desc };
    setSelectedHex(hex);
    //setIsHexModalOpen(true);

    setHexagonClassNames((prev) => {
      const updated = { ...prev };
      updated[index] = "clicked";
      return updated;
    });
    setHexagonFills((prev) => {
      const updated = { ...prev };
      updated[index] = "ship1";
      return updated;
    });
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

  const drawMap = () => {
    var newHexagons = [];
    map.forEach((item, index) => {
      const hexa = JSON.parse(item);

      if (isVisible(hexa)) {
        var hexagon = null;
        if (hexa.fill === "void") {
          var style = "void";
          hexagon = (
            <Hexagon
              className={hexagonClassNames[index] || style}
              fill={hexagonFills[index]}
              hexa={hexa}
              handleClick={() => handleHexClick(hexa, index)}
              key={index}
              index={index}
            ></Hexagon>
          );
        } else {
          var style = "planet";
          hexagon = (
            <Hexagon
              className={hexagonClassNames[index] || style}
              fill={hexagonFills[index] || hexa.fill}
              hexa={hexa}
              handleClick={() => handleHexClick(hexa, index)}
              key={index}
              index={index}
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

  useEffect(() => {
    const centerX = parseFloat(viewBox.split(" ")[0]) + parseFloat(viewBox.split(" ")[2]) / 2;
    const centerY = parseFloat(viewBox.split(" ")[1]) + parseFloat(viewBox.split(" ")[3]) / 2;
    const newWidth = 100 / scale;
    const newHeight = 100 / scale;
    const newViewBox = `${centerX - newWidth / 2} ${centerY - newHeight / 2} ${newWidth} ${newHeight}`;
    setViewBox(newViewBox);
  }, [scale]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get("http://127.0.0.1:8000/map/TxFsTzIMUEbQOsquv7vr");
      const data = response.data;
      setMapSize(data.size);
      setMap(data.map);
    }

    fetchData();
  }, []);

  useEffect(() => {
    drawMap();
  }, [hexagonFills]);

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

  var minZoom = 0.25 / (mapSize / 10);

  return (
    <div className="app">
      <div class="navbar">
        <p>Navbar</p>
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
        <Layout size={hexagonSize} flat={false} spacing={1} origin={{ x: -6, y: -6 }}>
          {hexagons}
        </Layout>
        <Patterns />
      </HexGrid>

      <div class="controlls-container">
        <p>Controlls Container</p>
      </div>

      {isHexModalOpen && <HexModal hex={selectedHex} handleClose={() => setIsHexModalOpen(false)} />}
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
