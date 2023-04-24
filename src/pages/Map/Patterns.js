import React from "react";
import { Pattern } from "react-hexgrid";
import Sun from "../../assets/img/sun.png";
import Agri from "../../assets/img/planets/planet-agri.webp";
import Mine from "../../assets/img/planets/planet-mine.webp";
import Indu from "../../assets/img/planets/planet-indu.webp";
import Atmo from "../../assets/img/planets/planet-atmo.webp";

import Base1 from "../../assets/img/ships/ship1/base/base.png";
import Base145 from "../../assets/img/ships/ship1/base/base45.png";
import Base190 from "../../assets/img/ships/ship1/base/base90.png";
import Base1135 from "../../assets/img/ships/ship1/base/base135.png";
import Base1_45 from "../../assets/img/ships/ship1/base/base-45.png";
import Base1_90 from "../../assets/img/ships/ship1/base/base-90.png";
import Base1_135 from "../../assets/img/ships/ship1/base/base-135.png";

import Ship145 from "../../assets/img/ships/ship1/ship/ship45.png";
import Ship190 from "../../assets/img/ships/ship1/ship/ship90.png";
import Ship1135 from "../../assets/img/ships/ship1/ship/ship135.png";
import Ship1_45 from "../../assets/img/ships/ship1/ship/ship-45.png";
import Ship1_90 from "../../assets/img/ships/ship1/ship/ship-90.png";
import Ship1_135 from "../../assets/img/ships/ship1/ship/ship-135.png";

import Miner145 from "../../assets/img/ships/ship1/miner/miner45.png";
import Miner190 from "../../assets/img/ships/ship1/miner/miner90.png";
import Miner1135 from "../../assets/img/ships/ship1/miner/miner135.png";
import Miner1_45 from "../../assets/img/ships/ship1/miner/miner-45.png";
import Miner1_90 from "../../assets/img/ships/ship1/miner/miner-90.png";
import Miner1_135 from "../../assets/img/ships/ship1/miner/miner-135.png";

const Patterns = () => (
  <>
    <Pattern id="sun" link={Sun} size={{ x: 11, y: 12 }} />
    <Pattern id="agri" link={Agri} size={{ x: 10, y: 12 }} />
    <Pattern id="mine" link={Mine} size={{ x: 10, y: 12 }} />
    <Pattern id="indu" link={Indu} size={{ x: 10, y: 12 }} />
    <Pattern id="atmo" link={Atmo} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1" link={Base1} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/45" link={Base145} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/-90" link={Base190} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/-135" link={Base1135} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/-45" link={Base1_45} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/90" link={Base1_90} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/135" link={Base1_135} size={{ x: 10, y: 12 }} />

    <Pattern id="ship/1/45" link={Ship145} size={{ x: 10, y: 12 }} />
    <Pattern id="ship/1/90" link={Ship190} size={{ x: 10, y: 12 }} />
    <Pattern id="ship/1/135" link={Ship1135} size={{ x: 10, y: 12 }} />
    <Pattern id="ship/1/-45" link={Ship1_45} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/-90" link={Ship1_90} size={{ x: 10, y: 12 }} />
    <Pattern id="base/1/-135" link={Ship1_135} size={{ x: 10, y: 12 }} />

    <Pattern id="miner/1/45" link={Miner145} size={{ x: 10, y: 12 }} />
    <Pattern id="miner/1/90" link={Miner190} size={{ x: 10, y: 12 }} />
    <Pattern id="miner/1/135" link={Miner1135} size={{ x: 10, y: 12 }} />
    <Pattern id="miner/1/-45" link={Miner1_45} size={{ x: 10, y: 12 }} />
    <Pattern id="miner/1/-90" link={Miner1_90} size={{ x: 10, y: 12 }} />
    <Pattern id="miner/1/-135" link={Miner1_135} size={{ x: 10, y: 12 }} />
  </>
);

export default Patterns;
