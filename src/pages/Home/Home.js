import { useState, useEffect } from "react";
import axios from "axios";

import "./Home.css";
import BackGroundVideo from "../../assets/video/background-home.webm";

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
        <div className="p-8 main-content">
          <h1 className="flex w-full justify-center font-bold text-center text-lime-400 text-6xl mb-8">
            Bienvenue sur Colons de Polaris
          </h1>
          <div className="container-main">
            <div className="bg-white rounded-md shadow-md p-4 mb-4 dark:bg-gray-800">
              <form
                className="flex flex-col items-center"
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
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
                >
                  Create GameRoom
                </button>
              </form>
            </div>

            <div className="bg-gray-800 rounded-md shadow-md p-4">
              <h2 className="text-lg font-bold mb-2 text-white">
                Règles du jeu
              </h2>
              <ul className="list-disc list-inside text-white">
                <li>Le jeu se joue à deux joueurs.</li>
                <li>Chaque joueur a 21 pièces.</li>
                <li>
                  Les joueurs se relaient pour placer une pièce sur le plateau.
                </li>
                <li>Le premier joueur à aligner 4 pièces gagne.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
