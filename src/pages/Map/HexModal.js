import React from "react";
import "./HexModal.css";

function HexModal({ hex, handleClose }) {
  // hex is the selected hexagon data
  // handleClose is a function to close the modal
  return (
    <div className="hex-modal">
      <div className="hex-content">
        <div className="hex-close" onClick={handleClose}>
          &times;
        </div>
        <div className="hex-info">
          <img src={hex.image} alt={hex.name} />
        </div>
        <div className="description-panel">
          <h2>{hex.name}</h2>
          <p>{hex.description}</p>
        </div>
      </div>
    </div>
  );
}

export default HexModal;
