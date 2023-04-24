import React from "react";
import { Hexagon } from "react-hexgrid";
import "./Hexagons.css";
const CustomHexagon = ({ style, hexa, fill, handleClick, index, highlight, onMouseEnter, onMouseLeave }) => (
  <Hexagon
    className={highlight ? "highlight" : style}
    stroke="#fff"
    strokeWidth="0.1"
    fill={fill}
    q={hexa.q}
    r={hexa.r}
    s={hexa.s}
    key={index}
    onClick={() => handleClick(hexa.q, hexa.r, hexa.s)}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  ></Hexagon>
);

export default React.memo(CustomHexagon);
