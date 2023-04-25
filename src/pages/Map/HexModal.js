import React from "react";
import "./HexModal.css";

function HexModal({ showModal, handleModalClose, hexa }) {
  return (
    <div className={hexa.name}>
      <button
        type="button"
        aria-hidden={!showModal}
        id="modalbg"
        title="close modal"
        onClick={handleModalClose}
      ></button>
      <div
        id="window-pane"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        aria-hidden={!showModal}
      >
        <div className="handle" data-augmented-ui>
          <span className="handle-details">
            <a href="" target="_blank">
              Ƽᕓ ԖΛĦ ĦⴿᕓƵϷԖΛϺ╥
            </a>
            <a href="" target="_blank" title="Corset">
              ƼᕓƓƼᕓ ՆЦ ╥ՆЩĦ
            </a>
          </span>
        </div>
        <div className="img-frame" data-augmented-ui>
          <img src={hexa.image} alt="placeholder" />
          <div className="under-text-detail" aria-hidden="true"></div>
        </div>
        <div className="details" data-augmented-ui>
          <h2 id="modal-title">{hexa.name}</h2>
          <p id="modal-desc">{hexa.description}</p>
          <button className="button" type="button" title="close modal" onClick={handleModalClose}>
            X
          </button>
          <div className="under-text-detail" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
}

export default HexModal;
