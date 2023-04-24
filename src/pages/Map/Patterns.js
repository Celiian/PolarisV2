import React from "react";
import { Pattern } from "react-hexgrid";
import Sun from "../../assets/img/sun.png";
import Agri from "../../assets/img/planets/planet-agri.webp";
import Mine from "../../assets/img/planets/planet-mine.webp";
import Indu from "../../assets/img/planets/planet-indu.webp";
import Atmo from "../../assets/img/planets/planet-atmo.webp";
import Base1 from "../../assets/img/ships/ship1/base.png";

const Patterns = () => (
  <>
    <Pattern id="sun" link={Sun} size={{ x: 11, y: 12 }} />
    <Pattern id="agri" link={Agri} size={{ x: 10, y: 12 }} />
    <Pattern id="mine" link={Mine} size={{ x: 10, y: 12 }} />
    <Pattern id="indu" link={Indu} size={{ x: 10, y: 12 }} />
    <Pattern id="atmo" link={Atmo} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1" link={Base1} size={{ x: 10, y: 12 }} />
  </>
);

export default Patterns;
