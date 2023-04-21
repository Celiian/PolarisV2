import { BrowserRouter, Route, Routes } from "react-router-dom";
import Map from "./pages/Map/Map"

function RoutesProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/map" element={<Map />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesProvider;
