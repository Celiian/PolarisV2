import { BrowserRouter, Route, Routes } from "react-router-dom";

import Map from "./pages/Map/Map";
import GameLobby from "./pages/GameLobby/GameLobby";
import Home from "./pages/Home/Home";

function RoutesProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/map" element={<Map />}></Route>
        <Route path="/lobby" element={<GameLobby />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesProvider;
