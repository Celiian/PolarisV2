import "./TradeModal.css";

const TradeModal = ({ showModal, handleClose }) => {
  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-700 rounded-md shadow-md p-4 w-4/5 max-w-lg">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              X
            </button>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Vos ressources
                </h3>
                <div className="flex flex-row flex-wrap items-center gap-2 text-white">
                  {/* {resources.map((resource) => (
                  <div
                    key={resource.name}
                    className="flex flex-row items-center bg-gray-800 rounded-md p-2"
                  >
                    <img
                      src={resource.icon}
                      alt={resource.name}
                      className="w-8 h-8 mr-2"
                    />
                    <span>{resource.amount}</span>
                  </div>
                ))} */}
                </div>
              </div>
              <div className="bg-gray-700 rounded-md shadow-md p-4">
                <h3 className="text-lg font-bold mb-2 text-white">
                  Trade avec le bot
                </h3>
                {/* <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between bg-gray-800 rounded-md p-2">
                  <div className="flex flex-row items-center">
                    <img
                      src={resourceTrading.buying.icon}
                      alt={resourceTrading.buying.name}
                      className="w-8 h-8 mr-2"
                    />
                    <span className="text-white font-bold">
                      {resourceTrading.buying.amount}{" "}
                      {resourceTrading.buying.name}
                    </span>
                  </div>
                  <div className="text-white font-bold">
                    {resourceTrading.cost} coins
                  </div>
                </div>
                <button
                  onClick={handleTrade}
                  className={`${
                    canTrade ? "bg-green-500 hover:bg-green-600" : "bg-gray-600"
                  } text-white font-bold py-2 px-4 rounded-md`}
                  disabled={!canTrade}
                >
                  Trade
                </button>
              </div> */}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeModal;
