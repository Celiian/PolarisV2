import React from "react";
import { Hexagon } from "react-hexgrid";
import "./Hexagons.css";
const CustomHexagon = ({ className, hexa, fill, handleClick, index }) => (
  <Hexagon
    className={className}
    stroke="#fff"
    strokeWidth="0.1"
    fill={fill}
    q={hexa.q}
    r={hexa.r}
    s={hexa.s}
    key={index}
    onClick={() => handleClick(hexa.q, hexa.r, hexa.s)}
  ></Hexagon>
);

export default React.memo(CustomHexagon);
