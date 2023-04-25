// MiniMap.js
import React, { useState, useEffect } from "react";
import { HexGrid, Layout } from "react-hexgrid";
import Hexagon from "./Hexagons";
import "./MiniMap.css";

function MiniMap({ miniMap, hexaSize, isOpen, handleClose }) {
  const [hexagons, setHexagons] = useState([]);

  useEffect(() => {
    var newHexagons = [];
    miniMap.forEach((item, index) => {
      const hexa = JSON.parse(item);
      const hexagon = <Hexagon hexa={hexa} handleClick={() => {}}></Hexagon>;
      newHexagons.push(hexagon);
    });
    setHexagons(newHexagons);
  }, [miniMap]);

  if (!isOpen) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <HexGrid width={"200px"} height={"200px"}>
          <Layout size={{ x: hexaSize[0], y: hexaSize[1] }} flat={false} spacing={1} origin={{ x: -6, y: -6 }}>
            {hexagons}
          </Layout>
        </HexGrid>
        <button className="close-button" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default MiniMap;
