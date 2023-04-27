import "./NavBar.css";

// Ressources
import water from "../../assets/img/ressources/foods/water.png";
import food_can from "../../assets/img/ressources/foods/food_can.png";
import ship_engine from "../../assets/img/ressources/ship_engine.png";
import uranium from "../../assets/img/ressources/mine/uranium.png";
import coins from "../../assets/img/ressources/coins.png";
import ore from "../../assets/img/ressources/mine/iron.png";
import crystal from "../../assets/img/ressources/mine/crystal.png";

// Assets bases
import Base1 from "../../assets/img/ships/ship1/base/base.png";
import Base2 from "../../assets/img/ships/ship2/base/base.png";
import Base3 from "../../assets/img/ships/ship3/base/base.png";
import Base4 from "../../assets/img/ships/ship4/base/base.png";

const ressourceImages = {
  water: water,
  foodCan: food_can,
  shipEngine: ship_engine,
  uranium: uranium,
  coins: coins,
  ore: ore,
  crystal: crystal,
};

const ships = {
  Base1,
  Base2,
  Base3,
  Base4,
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
                  <img className="img-ship-players" src={ships[`Base${player.id}`]} alt={`ship-player${player.id}`} />
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
          {ressources &&
            Object.entries(ressources).map(([key, value]) => (
              <div className="resources" key={key}>
                <img className="ressource-img" src={ressourceImages[key]} alt={key} />
                <p className="ressources-value">
                  {key} : {value}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
