import "./ShipModal.css";

function ShipModal({ ship, handleClose, handleMove }) {
  return (
    <div className="ship-modal">
      <h2>{ship.fill}</h2>
      <div className="ship-modal-choices">
        <button
          onClick={() => {
            handleMove(ship);
          }}
        >
          Move
        </button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
}

export default ShipModal;
