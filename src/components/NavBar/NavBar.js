import "./NavBar.css";

import food from "../../assets/img/ressources/foods/food.png";
import water from "../../assets/img/ressources/foods/water.png";

import diamonds from "../../assets/img/ressources/mine/diamonds.png";
import iron from "../../assets/img/ressources/mine/iron.png";
import uranium from "../../assets/img/ressources/mine/uranium.png";

import Ship1 from "../../assets/img/ships/ship1/ship/ship.png";
import Ship2 from "../../assets/img/ships/ship2/ship/ship.png";
import Ship3 from "../../assets/img/ships/ship3/ship/ship.png";
import Ship4 from "../../assets/img/ships/ship4/ship/ship.png";

const ressourceImages = {
  diamonds: diamonds,
  uranium: uranium,
  energy: uranium,
  "freeze-dried": food,
  steel: iron,
  water: water,
  hydrogene: uranium,
};

const ships = {
  Ship1,
  Ship2,
  Ship3,
  Ship4,
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
                    src={ships[`Ship${player.number}`]}
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
