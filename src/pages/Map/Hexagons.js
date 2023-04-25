import React from "react";
import { Hexagon } from "react-hexgrid";
import "./Hexagons.css";
const CustomHexagon = ({ style, stroke, hexa, fill, handleClick, index, onMouseEnter, onMouseLeave }) => (
  <Hexagon
    className={style}
    stroke={stroke}
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
