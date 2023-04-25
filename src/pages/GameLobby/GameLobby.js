import { useState, useEffect } from "react";
import axios from "axios";

//Import components
import InviteButton from "../../components/InviteButton/InviteButton";
import StartButton from "../../components/StartButton/StartButton";

import "./GameLobby.css";
import CrownAstronautLogo from "../../assets/img/icons/crown_astronaut.png";
import AstronautLogo from "../../assets/img/icons/astronaut.png";
import BackGroundVideo from "../../assets/video/background-home.webm";
import GameLogo from "../../assets/img/icons/logo.png"

function GameLobby() {
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playerOwner, setPlayerOwner] = useState("");
  const [namePlayer, setNamePlayer] = useState("");
  const [numberPlayer, setNumberPlayer] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [GameRoomID, setGameRoomID] = useState("");
  const [TokenAccessGame, setTokenAccessGame] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [accessStartBtn, setAccessStartBtn] = useState(true);

  const baseUrl = "http://127.0.0.1:8000/";

  const getGameRoomByToken = async (token_game_room) => {
    try {
      const response = await axios.get(
        baseUrl + `game_room/token/${token_game_room}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const joinRoomGame = async (player_name, token_game_room) => {
    try {
      const response = await axios.post(
        baseUrl + `join/game_room/${player_name}/${token_game_room}`
      );
      const { name, number } = response.data.player_data;
      setNamePlayer(name);
      setNumberPlayer(number);
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const startRoomGame = async (GameRoomID) => {
    try {
      const response = await axios.post(
        baseUrl + `start/game_room/${GameRoomID}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const generateMap = async (GameRoomID) => {
    try {
      const response = await axios.post(
        baseUrl + `map/generate/40/${GameRoomID}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  useEffect(() => {
    if (started) {
      window.location.href = "/map";
    }
  }, [started]);

  useEffect(() => {
    const connectWebSocket = () => {
      console.log("Starting connection to WebSocket Server");
      var ws = new WebSocket(`ws://localhost:8000/gameroom/${TokenAccessGame}`);

      ws.onopen = () => {
        console.log("WebSocket is open now.");
        ws.send(JSON.stringify({ request: "/game_room" }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPlayers(data.players);
        setStarted(data.started);
      };

      ws.onclose = () => {
        console.log("closing connection");
        ws.close();
      };
    };

    if (GameRoomID) {
      connectWebSocket();
    } else {
      console.log("WebSocket is not yet open, cannot send message");
    }
  }, [GameRoomID]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("room");
    if (token && token.endsWith("1")) {
      setShowModal(true);
      setAccessStartBtn(false);
    } else {
      setShowModal(false);
      setAccessStartBtn(true);
    }
    const cleanToken = token.slice(0, -2);
    setTokenAccessGame(cleanToken);

    if (TokenAccessGame) {
      (async () => {
        const response = await getGameRoomByToken(TokenAccessGame);
        setGameRoomID(response.id_doc_game_room);
        setPlayerOwner(response.room_game_owner);
      })();
    }
  }, [TokenAccessGame]);

  const copyInviteLink = () => {
    let linkInvite = `${window.location.origin}/lobby?room=${TokenAccessGame}=1`;
    navigator.clipboard.writeText(linkInvite).then(
      () => {
        console.log("Lien copié dans le presse-papiers :", linkInvite);
      },
      () => {
        console.error("Erreur lors de la copie du lien dans le presse-papiers");
      }
    );
    localStorage.setItem("linkInviteGameRoom", linkInvite);
  };

  const startGame = async () => {
    startRoomGame(GameRoomID); // update started true
    if (GameRoomID) {
      console.log(numberPlayer);
      localStorage.setItem("GameRoomID", GameRoomID);
      localStorage.setItem("namePlayer", namePlayer);
      localStorage.setItem("numberPlayer", numberPlayer);
      generateMap(GameRoomID);
    }
  };

  const submitFormJoin = (event) => {
    event.preventDefault();
    setIsRedirecting(true);
    joinRoomGame(namePlayer, TokenAccessGame);
    setShowModal(false);
  };

  return (
    <>
      <div className="gameroom-container">
        <div className="video-wrapper">
          <video autoPlay loop muted src={BackGroundVideo}></video>
        </div>
        <div className="p-10 flex flex-col">
        <div className="logo-container">
                <img className="game-logo-img" src={GameLogo} alt="logo-game" />
            </div>
          <div className="flex flex-row justify-around">
            <div className="players-list-container">
              <div className="flex flex-col w-9/12 h-full">
                <p className="owner-player-p">
                  <img
                    className="owner_player_logo"
                    src={CrownAstronautLogo}
                    alt="Logo Owner Astronaut"
                  />
                  {playerOwner}
                </p>
                {players.map((player, index) => (
                  <div key={index} className="pt-5">
                    {player.name ? (
                      <p className="players_logos_lobby">
                        <img
                          className="players_logo"
                          src={AstronautLogo}
                          alt="Logo Astronaut"
                        />
                        {player.name}
                      </p>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="options-container">
              <p>Voici tous les options</p>
              <ul>
                <li>Taille de la Carte</li>
                <li>Nombre de joueurs</li>
                <li>Durée de partie</li>
                <li>Voleur</li>
              </ul>
              <div className="main-buttons-actions">
                <InviteButton
                  message={"Invite"}
                  onClickFunction={copyInviteLink}
                />
                {accessStartBtn === true && (
                  <StartButton message={"Launch"} onClickFunction={startGame} />
                )}
              </div>
            </div>
          </div>
        </div>
        {showModal === true && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              &#8203;
              <div
                className="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3
                      className="text-lg leading-6 font-medium text-white"
                      id="modal-headline"
                    >
                      Entrez votre nom pour rejoindre la partie
                    </h3>
                    <div className="mt-2">
                      <form onSubmit={submitFormJoin}>
                        <div className="mb-4">
                          <input
                            type="text"
                            id="name"
                            value={namePlayer}
                            onChange={(e) => setNamePlayer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            placeholder="Entrez votre nom"
                          />
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                          >
                            Rejoindre la partie
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default GameLobby;
