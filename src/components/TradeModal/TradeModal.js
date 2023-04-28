import "./TradeModal.css";

// Ressources
import water from "../../assets/img/ressources/foods/water.png";
import food_can from "../../assets/img/ressources/foods/food_can.png";
import ship_engine from "../../assets/img/ressources/ship_engine.png";
import uranium from "../../assets/img/ressources/mine/uranium.png";
import coins from "../../assets/img/ressources/coins.png";
import ore from "../../assets/img/ressources/mine/iron.png";
import crystal from "../../assets/img/ressources/mine/crystal.png";

const ressourceImages = {
  water: water,
  foodCan: food_can,
  shipEngine: ship_engine,
  uranium: uranium,
  coins: coins,
  ore: ore,
  crystal: crystal,
};

const TradeModal = ({ showModal, handleClose, ressources, handleTrade }) => {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-700 rounded-md shadow-md p-4 w-4/5 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Your ressources
                </h3>
                <div className="flex flex-row flex-wrap items-center gap-2 text-white">
                  {Object.entries(ressources).map(([key, value]) => (
                    <div className="resources" key={key}>
                      <img
                        className="ressource-img"
                        src={ressourceImages[key]}
                        alt={key}
                      />
                      <p className="ressources-value">
                        {key} : {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <div className="trade-main-container">
                  <h3 className="text-lg font-bold text-white">Trades</h3>
                  <button className="btn-close-trade" onClick={handleClose}>
                    X
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between bg-gray-800 rounded-md p-2">
                    <div className="flex flex-row items-center">
                      <img
                        src={ressourceImages.water}
                        alt="Water"
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-white font-bold">5 Water</span>
                    </div>
                    <div className="text-white font-bold">3 coins</div>
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
        </div>
      )}
    </>
  );
};

export default TradeModal;
