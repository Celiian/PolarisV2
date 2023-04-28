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

import MenuItem from "@mui/material/MenuItem";

import { toast } from "react-toastify";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";
import { setPlayerData } from "../../utils/utils";
import { Token } from "@mui/icons-material";

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

const ressourceValue = {
  water: 5,
  foodCan: 5,
  shipEngine: 200,
  shipPart: 100,
  uranium: 150,
  ore: 20,
  crystal: 50,
};

const TradeModal = ({ showModal, handleClose, player, token }) => {
  const [ressourceSelected, setRessourceSelected] = useState("");
  const [tradeSelected, setTradeSelected] = useState("");
  const [showQuantityRessources, showQuantitySelected] = useState(false);
  const [cost, setCost] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [quantityTrade, setQuantityTrade] = useState(0);

  const handleChangeRessources = (event) => {
    setRessourceSelected(event.target.value);
    showQuantitySelected(true);
    setCost(quantity * ressourceValue[event.target.value]);
  };

  const handleChangeTrades = (event) => {
    setTradeSelected(event.target.value);
    setQuantity(quantityTrade * (ressourceValue[event.target.value] * 2));
  };

  const handleChangeRssBuy = (event) => {
    setQuantity(event.target.value);
    if (ressourceSelected != "coins") {
      setCost(quantity * ressourceValue[ressourceSelected]);
      setQuantityTrade(0);
    } else {
      setQuantityTrade(event.target.value * (ressourceValue[tradeSelected] * 2));
      setCost(0);
    }
  };

  const handleChangeTradeQtt = (event) => {
    setQuantityTrade(event.target.value);
    setQuantity(event.target.value * (ressourceValue[tradeSelected] * 2));
  };

  const handleTradeValidation = () => {
    if (cost == 0 && quantityTrade != 0 && quantity != 0) {
      if (quantity <= player.ressources.coins) {
        player.ressources.coins -= quantity;
        player.ressources[tradeSelected] += quantityTrade;

        setPlayerData(player, token);
        toast("You bought " + quantityTrade + " " + tradeSelected + " for " + quantity + " coins", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        toast("You don't have enought coins", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } else if (ressourceSelected && cost > 0) {
      if (player.ressources[ressourceSelected] >= quantity) {
        player.ressources[ressourceSelected] -= quantity;
        player.ressources.coins += cost;

        setPlayerData(player, token);
        toast("You sold " + quantity + " " + tradeSelected + " for " + cost + " coins", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } else {
        toast("You don't have enought " + ressourceSelected, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
          style={{
            color: "white",
          }}
        >
          <div className="bg-gray-700 rounded-md shadow-md p-4 w-4/5 max-w-lg h-72">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <h3 className="text-lg font-bold mb-2 text-white">Your ressources</h3>
                <div className="flex flex-row flex-wrap items-center gap-2 text-white">
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      value={ressourceSelected}
                      onChange={handleChangeRessources}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                    >
                      {Object.entries(player.ressources).map(([key]) => (
                        <MenuItem key={key} value={key}>
                          <img className="ressource-img" src={ressourceImages[key]} alt={key} />
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                    {ressourceSelected && (
                      <TextField
                        id="outlined-basic"
                        label={ressourceSelected == "coins" ? "Price to pay" : "Quantity to sell"}
                        inputProps={{ type: "number" }}
                        variant="outlined"
                        onChange={handleChangeRssBuy}
                        value={quantity}
                      />
                    )}
                  </FormControl>
                  {showQuantityRessources === true ? (
                    <p>
                      You have {player.ressources[ressourceSelected]} {ressourceSelected}
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

                <div className="trade-main-container ">
                  {ressourceSelected === "coins" ? (
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                      <Select
                        value={tradeSelected}
                        onChange={handleChangeTrades}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                      >
                        {Object.entries(player.ressources)
                          .filter(([key]) => key !== "coins")
                          .map(([key]) => (
                            <MenuItem key={key} value={key}>
                              <img className="ressource-img" src={ressourceImages[key]} alt={key} />
                              {key}
                            </MenuItem>
                          ))}
                      </Select>
                      {tradeSelected && (
                        <TextField
                          id="outlined-basic"
                          label="Quantity to buy"
                          inputProps={{ type: "number" }}
                          variant="outlined"
                          onChange={handleChangeTradeQtt}
                          value={quantityTrade}
                        />
                      )}
                    </FormControl>
                  ) : (
                    <>
                      <div className="coins-trading-container" style={{ padding: "10px" }}>
                        <div className="coins-container">
                          <img className="ressource-img" src={ressourceImages.coins} alt={"coins"} />
                          <p>Coins</p>
                        </div>
                      </div>
                      <div className="pt-5">
                        <p style={{ color: "white", fontWeight: "bold" }}>You can selll it for : {cost}</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
                  onClick={handleTradeValidation}
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
