import { useState, useEffect } from "react";
import axios from "axios";

import "./Home.css";
import BackGroundVideo from "../../assets/video/background-home.webm";
import GameLogo from "../../assets/img/icons/logo.png";

function Home() {
  const [nameOwnerPlayer, setNameOwnerPlayer] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [lien, setLien] = useState("");

  const baseUrl = "http://127.0.0.1:8000/";

  useEffect(() => {
    console.log(lien);
  }, [lien]);

  useEffect(() => {
    if (generatedToken !== "") {
      setLien("/lobby?room=" + generatedToken + "=0");
    } else {
      generateLink();
    }
  }, [generatedToken, nameOwnerPlayer]);

  const createRoomGame = async (namePlayer, token_game_room) => {
    try {
      const response = await axios.post(
        baseUrl + `create/game_room/${namePlayer}/${token_game_room}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const generateLink = async () => {
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
    setGeneratedToken(generatedToken);
  };

  const submitFormCreate = async (event) => {
    event.preventDefault();
    const namePlayerInput = nameOwnerPlayer;
    await generateLink();
    const tokenRoom = generatedToken;
    createRoomGame(namePlayerInput, tokenRoom)
      .then((response) => {
        window.location.href = lien;
      })
      .catch((error) => {
        console.log(error);
      });
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
              <h2 className="text-center" style={{color:"white"}}>Create GameRoom</h2>
                <form
                  className="flex flex-col items-center h-full justify-center"
                  onSubmit={submitFormCreate}
                >
                  <div className="mb-4">
                    <input
                      type="text"
                      id="name"
                      value={nameOwnerPlayer}
                      onChange={(e) => setNameOwnerPlayer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Entrez votre nom"
                    />
                  </div>
                  <button type="submit" className="custom-button">
                    Create
                  </button>
                </form>
              </div>
            </div>

            <div className="container-rules">
              <div className="bg-gray-800 rounded-md shadow-md p-4">
                <h2 className="text-lg font-bold mb-2 text-white">
                  Règles du jeu
                </h2>
                <ul className="list-disc list-inside text-white p-3">
                  <li>4 joueurs maximum pour jouer une partie</li>
                  <li>
                    Les joueurs collectent des ressources pour construire des
                    <br />
                    vaisseaux, des stations spatiales ...
                  </li>
                  <li>
                    Les joueurs peuvent construire des vaisseaux spatiaux
                    équipés
                    <br />
                    pour explorer, conquérir.
                  </li>
                  <li>
                    Les joueurs peuvent construire des stations de minage pour
                    collecter des
                    <br />
                    ressources, produire de l'énergie et protéger leur
                    territoire.
                  </li>
                  <li>
                    Les joueurs investissent dans des technologies avancées pour
                    <br />
                    améliorer leurs vaisseaux spatiaux, leurs bases et leurs
                    mineurs.
                  </li>
                  <li>
                    Les joueurs envoient des vaisseaux pour explorer de nouveaux
                    <br />
                    territoires, découvrir des ressources et trouver des
                    minerais rares.
                  </li>
                  <li>
                    Les joueurs échangent des ressources, des technologies et
                    des
                    <br />
                    minerais rares.
                  </li>
                  <li>
                    Condition de Victoire : Le joueur qui atteint en premier le
                    nombre
                    <br />
                    de total de 10 points de victoire remporte la partie
                  </li>
                  <li>
                    Les joueurs peuvent gagner des points de victoire en<br></br>
                    construisant des éléments spatiaux (bases, vaisseaux, <br></br>
                    mineurs), en découvrant des ressources et des minerais<br></br>
                    rares, et en échangeant des ressources, des technologies et<br></br>
                    des minerais avec les autres joueurs.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
