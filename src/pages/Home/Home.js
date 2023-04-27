import React, { useState, useEffect } from "react";
import { ref, onValue, off, set } from "firebase/database";
import "./Home.css";
import db from "../../firebaseConfig";

import BackGroundVideo from "../../assets/video/background-home.webm";
import GameLogo from "../../assets/img/icons/logo.png";
import backgroundSound from "../../assets/sound/ost.mp3";

const Home = () => {
  const [nameOwnerPlayer, setNameOwnerPlayer] = useState("");

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

  const generateLink = () => {
    const lienGenere = localStorage.getItem("lienGenere");
    if (lienGenere) {
      console.log("Le lien a déjà été généré :", lienGenere);
      return;
    }
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let generatedToken = "";
    for (let i = 0; i < 15; i++) {
      generatedToken += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return generatedToken;
  };

  const submitFormCreate = async () => {
    var token = generateLink();
    await setDataInDatabase(
      {
        players: [
          {
            name: nameOwnerPlayer,
            id: 1,
            ready: false,
            ressources: {
              Water: 10,
              FoodCan: 10,
              ShipEngine: 10,
              Coins: 10,
              Uranium: 10,
              Iron: 10,
              Crystal: 10,
            },
          },
        ],
        started: false,
        token_game_room: token,
        turn: 0,
      },
      "/game_room/" + token
    );
    localStorage.setItem("player_id", 1);

    window.location.href = "/lobby?room=" + token + "0";
  };

  const setDataInDatabase = async (data, path) => {
    const databaseRef = ref(db, path);

    await set(databaseRef, data);
  };

  localStorage.clear();

  return (
    <>
      <div className="h-screen">
        <div className="video-wrapper">
          <video autoPlay loop muted src={BackGroundVideo}></video>
        </div>
        <div className="main-content">
          <div className="logo-container">
            <img className="game-logo-img" src={GameLogo} alt="logo-game" />
          </div>
          <div className="container-main">
            <div className="container-form-create-game">
              <div className="bg-white rounded-md shadow-md p-4 mb-4 dark:bg-gray-800 w-full">
                <h2 className="text-center" style={{ color: "white" }}>
                  Create GameRoom
                </h2>
                <div className="mb-4">
                  <input
                    type="text"
                    id="name"
                    value={nameOwnerPlayer}
                    onChange={(e) => setNameOwnerPlayer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter name"
                  />
                </div>
                <div className="container-btn-create">
                  <button className="custom-button" onClick={submitFormCreate}>
                    Create
                  </button>
                </div>
              </div>
            </div>

            <div className="container-rules">
              <div className="bg-gray-800 rounded-md shadow-md p-4">
                <h2 className="text-lg font-bold mb-2 text-white">
                  Game Rules
                </h2>
                <ul className="list-disc list-inside text-white p-3">
                  <li>Maximum 4 players to play a game</li>
                  <li>
                    Players collect resources to build ships, space stations
                    ships, space stations ...
                  </li>
                  <li>
                    Players can build equipped spaceshipsto explore, conquer.
                  </li>
                  <li>
                    Players can build mining stations to collect resources,
                    produce energy and
                    <br />
                    resources, produce energy and protect their territory.
                  </li>
                  <li>
                    Players invest in advanced technologies to improve their
                    spaceships
                    <br />
                    improve their spaceships, bases and miners.
                  </li>
                  <li>
                    Players send ships to explore new territories, discover
                    resources and find
                    <br />
                    discover resources and find rare ores.
                  </li>
                  <li>
                    Players trade resources, technology and rare minerals.
                    <br />
                    rare minerals.
                  </li>
                  <li>
                    Victory Condition: The player who first reaches the total of
                    10 victory points wins.
                    <br />
                    total of 10 victory points wins the game
                  </li>
                  <li>
                    Players can gain victory points by building space elements
                    (bases, ships, miners), <br></br>
                    discovering resources and resources and minerals, <br></br>
                    and by trading resources, technology and minerals with other
                    players.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
