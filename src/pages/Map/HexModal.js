import React from "react";
import "./HexModal.css";

function HexModal({ showModal, handleModalClose }) {
  return (
    <>
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
          <img
            src="https://freepngimg.com/save/24578-space-planet-transparent-background/1000x1000"
            alt="placeholder"
          />
          <div className="under-text-detail" aria-hidden="true"></div>
        </div>
        <div className="details" data-augmented-ui>
          <h2 id="modal-title">Agricultural Planet</h2>
          <p id="modal-desc">
            This is an agricultural planet, where lush fields of crops and healthy livestock are the norm. The
            inhabitants of this planet have dedicated themselves to sustainable farming practices, ensuring the health
            and productivity of their land for generations to come.
          </p>
          <button className="button" type="button" title="close modal" onClick={handleModalClose}>
            X
          </button>
          <div className="under-text-detail" aria-hidden="true"></div>
        </div>
      </div>
    </>
  );
}

export default HexModal;
