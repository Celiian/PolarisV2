import { useState } from "react";

import "./TradeModal.css";

// Ressources
import water from "../../assets/img/ressources/foods/water.png";
import food_can from "../../assets/img/ressources/foods/food_can.png";
import ship_engine from "../../assets/img/ressources/ship_engine.png";
import uranium from "../../assets/img/ressources/mine/uranium.png";
import coins from "../../assets/img/ressources/coins.png";
import ore from "../../assets/img/ressources/mine/iron.png";
import crystal from "../../assets/img/ressources/mine/crystal.png";
import ship_part from "../../assets/img/ressources/ship_part.png";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";

const ressourceImages = {
  water: water,
  foodCan: food_can,
  shipEngine: ship_engine,
  shipPart: ship_part,
  uranium: uranium,
  coins: coins,
  ore: ore,
  crystal: crystal,
};

const TradeModal = ({ showModal, handleClose, ressources, handleTrade }) => {
  const [ressourceSelected, setRessourceSelected] = useState("");
  const [tradeSelected, setTradeSelected] = useState("");
  const [showQuantityRessources, showQuantitySelected] = useState(false);

  const handleChangeRessources = (event) => {
    setRessourceSelected(event.target.value);
    showQuantitySelected(true);
  };

  const handleChangeTrades = (event) => {
    setTradeSelected(event.target.value);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-700 rounded-md shadow-md p-4 w-4/5 max-w-lg h-72">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Your ressources
                </h3>
                <div className="flex flex-row flex-wrap items-center gap-2 text-white">
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      value={ressourceSelected}
                      onChange={handleChangeRessources}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                    >
                      {Object.entries(ressources).map(([key]) => (
                        <MenuItem key={key} value={key}>
                          <img
                            className="ressource-img"
                            src={ressourceImages[key]}
                            alt={key}
                          />
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showQuantityRessources === true ? (
                    <p>
                      You have {ressources[ressourceSelected]}{" "}
                      {ressourceSelected}
                    </p>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
              <div className="bg-gray-700 rounded-md shadow-md p-4 h-full">
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold mb-2 text-white">Trades</h3>
                  <button className="btn-close-trade" onClick={handleClose}>
                    X
                  </button>
                </div>

                <div className="trade-main-container">
                  {ressourceSelected === "coins" ? (
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                      <Select
                        value={tradeSelected}
                        onChange={handleChangeTrades}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                      >
                        {Object.entries(ressources)
                          .filter(([key]) => key !== "coins")
                          .map(([key]) => (
                            <MenuItem key={key} value={key}>
                              <img
                                className="ressource-img"
                                src={ressourceImages[key]}
                                alt={key}
                              />
                              {key}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <>
                      <div
                        className="coins-trading-container"
                        style={{ padding: "10px" }}
                      >
                        <TextField
                          id="outlined-basic"
                          label="CoinsNumber"
                          inputProps={{ type: "number" }}
                          variant="outlined"
                        />
                        <div className="coins-container">
                          <img
                            className="ressource-img"
                            src={ressourceImages.coins}
                            alt={"coins"}
                          />
                          <p>Coins</p>
                        </div>
                      </div>
                      <div className="pt-5">
                        <p style={{ color: "white", fontWeight: "bold" }}>
                          Remaining coins: {}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                  onClick={handleTrade}
                >
                  Trade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeModal;
