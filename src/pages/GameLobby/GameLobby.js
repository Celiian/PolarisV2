import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ref, onValue, off, set, update } from "firebase/database";
import db from "../../firebaseConfig";
import "./GameLobby.css";
import InviteButton from "../../components/InviteButton/InviteButton";
import StartButton from "../../components/StartButton/StartButton";

import { generate_map } from "../../utils/utils";
import CrownAstronautLogo from "../../assets/img/icons/crown_astronaut.png";
import AstronautLogo from "../../assets/img/icons/astronaut.png";
import BackGroundVideo from "../../assets/video/background-home.webm";
import GameLogo from "../../assets/img/icons/logo.png";
import backgroundSound from "../../assets/sound/ost.mp3";
import { RoomRounded } from "@mui/icons-material";

const GameLobby = () => {
  const [roomData, setRoomData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accessStartBtn, setAccessStartBtn] = useState(true);
  const [namePlayer, setNamePlayer] = useState("");
  const [token, setToken] = useState("");
  const path = "/game_room/";

  useEffect(() => {
    const audio = new Audio(backgroundSound);

    const playAudio = () => {
      if (audio.duration > 0 && !audio.paused) {
        return;
      }
      audio.loop = true;
      audio.play();
    };

    document.addEventListener("click", playAudio);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    var token = params.get("room");
    if (token && token.endsWith("1")) {
      setShowModal(true);
      setAccessStartBtn(false);
    } else {
      setShowModal(false);
      setAccessStartBtn(true);
    }
    token = token.slice(0, -1);
    setToken(token);
    localStorage.setItem("room_token", token);

    const databaseRef = ref(db, path + token);
    onValue(databaseRef, (snapshot) => {
      setRoomData(snapshot.val());
      if (snapshot.val().started) {
        window.location.href = "/map";
      }
    });

    return () => {
      off(databaseRef);
    };
  }, []);

  const setDataInDatabase = async (data, path) => {
    const databaseRef = ref(db, path);

    await set(databaseRef, data);
  };

  const setMapInDb = async (data, path) => {
    const databaseRef = ref(db, path);
    try {
      const updates = {};
      data.forEach((doc) => {
        const docPath = `${doc.coord.q}_${doc.coord.r}_${doc.coord.s}`;
        updates[docPath] = doc;
      });
      await update(databaseRef, updates);
      console.log("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data: ", error);
    }
  };

  const submitFormJoin = async (event) => {
    event.preventDefault();
    setShowModal(false);

    var newData = roomData;
    var player_id = roomData.players.length + 1;
    localStorage.setItem("player_id", player_id);

    newData.players.push({
      id: player_id,
      name: namePlayer,
      points: 1,
      ready: false,
      ship: 0,
      ressources: {
        water: 10,
        foodCan: 10,
        shipEngine: 20,
        shipPart: 60,
        coins: 100,
        uranium: 10,
        ore: 10,
        crystal: 10,
      },
    });

    await setDataInDatabase(newData, path + localStorage.getItem("room_token"));
  };

  const copyInviteLink = () => {
    let linkInvite = `${window.location.origin}/lobby?room=${token}1`;
    navigator.clipboard.writeText(linkInvite).then(
      () => {
        console.log("Lien copié dans le presse-papiers :", linkInvite);
        toast("Invitation Link copied !", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      },
      () => {
        console.error("Erreur lors de la copie du lien dans le presse-papiers");
      }
    );
  };

  const startGame = async () => {
    await setDataInDatabase(true, path + token + "/started/");
    window.location.href = "/map";
  };

  const setMap = async () => {
    const map = generate_map(40, roomData.players);
    await setMapInDb(map, path + token + "/map/");

    startGame();
  };

  return (
    <>
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="gameroom-container">
        <div className="video-wrapper">
          <video autoPlay loop muted src={BackGroundVideo}></video>
        </div>
        <div className="p-10 flex flex-col">
          <div className="logo-container">
            <img className="game-logo-img" src={GameLogo} alt="logo-game" />
          </div>
          <div className="flex flex-col items-center">
            <div className="players-list-container">
              <div className="flex flex-col w-9/12 h-full">
                {roomData ? (
                  roomData.players.map((player, index) => (
                    <div key={index} className="pt-5">
                      {player.name ? (
                        <p className="players_logos_lobby">
                          {player.id == 1 ? (
                            <img className="owner_player_logo" src={CrownAstronautLogo} alt="Logo Owner Astronaut" />
                          ) : (
                            <img className="players_logo" src={AstronautLogo} alt="Logo Astronaut" />
                          )}
                          {player.name}
                        </p>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="main-buttons-actions">
              <InviteButton message={"Invite"} onClickFunction={copyInviteLink} />
              {accessStartBtn === true && roomData && roomData.players.length > 1 && (
                <StartButton message={"Launch"} onClickFunction={setMap} />
              )}
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
                    <h3 className="text-lg leading-6 font-medium text-white" id="modal-headline">
                      Join GameRoom
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
                            placeholder="Enter name"
                          />
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                          >
                            Join
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
};

export default GameLobby;
