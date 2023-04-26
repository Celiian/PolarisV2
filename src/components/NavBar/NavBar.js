import "./NavBar.css";

import food from "../../assets/img/ressources/foods/food.png";
import water from "../../assets/img/ressources/foods/water.png";

import diamonds from "../../assets/img/ressources/mine/diamonds.png";
import iron from "../../assets/img/ressources/mine/iron.png";
import uranium from "../../assets/img/ressources/mine/uranium.png";

const ressourceImages = {
  diamonds: diamonds,
  uranium: uranium,
  energy: uranium,
  "freeze-dried": food,
  steel: iron,
  water: water,
  hydrogene: uranium,
};

export default function NavBar({ players, ressources }) {
  return (
    <div className="navbar">
      <div className="player-list-container">
        {players.map((player, index) => (
          <div key={index} className="players">
            {player.name ? (
              <>
                <div className="player-container">
                  <img
                    className="img-ship-players"
                    src={`ships[Ship${player.number}]`}
                    alt={`ship-player${player.number}`}
                  />
                </div>
                <p>{player.name}</p>
              </>
            ) : (
              <div className="player-container"></div>
            )}
          </div>
        ))}
      </div>
      <div className="ressources-list-container">
        <div className="ressources-list">
          {Object.entries(ressources).map(([key, value]) => (
            <div className="resources" key={key}>
              <img className="ressource-img" src={ressourceImages[key]} alt={key} />
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
