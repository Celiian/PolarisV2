import React from "react";
import "./HexModal.css";
import CyberButton from "../cyberButton/CyberButton";

function HexModal({
  showModal,
  handleModalClose,
  hexa,
  button1 = false,
  dataButton1 = {},
  function1 = () => {},
  button2 = false,
  dataButton2 = {},
  function2 = () => {},
}) {
  return (
    <div className={hexa.fill}>
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
          <div className="test">
            <p id="modal-desc">{hexa.description}</p>

            <div className="btn-contianer">
              {button1 && (
                <CyberButton
                  message={dataButton1.message}
                  toolTip={dataButton1.toolTip}
                  style={dataButton1.style}
                  onClick={() => function1()}
                  className="btn-miner"
                ></CyberButton>
              )}
              {button2 && (
                <CyberButton
                  message={dataButton2.message}
                  toolTip={dataButton2.toolTip}
                  style={dataButton2.style}
                  onClick={() => function2()}
                  className="btn-miner"
                ></CyberButton>
              )}
            </div>
          </div>
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
