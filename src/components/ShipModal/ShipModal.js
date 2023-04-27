import "./ShipModal.css";
import CyberButtonGlitched from "../CyberButtonGlitched/CyberButtonGlitched";

function ShipModal({ ship, handleClose, handleMove, handleBuild }) {
  return (
    <div className="ship-modal">
      <div className="title-modal">
        <h2 className="text-center">Ship</h2>
        <button className="btn-cross-modal-ship" onClick={handleClose}>
          X
        </button>
      </div>
      <div className="ship-modal-choices">
        <button
          onClick={() => {
            handleMove(ship);
          }}
        >
          Move
        </button>
        <CyberButtonGlitched
          onClick={handleBuild}
          message={"Build"}
          color={"red"}
        />
      </div>
    </div>
  );
}

export default ShipModal;
