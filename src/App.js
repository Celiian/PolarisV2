import React, { useEffect } from "react";
import backgroundSound from "./assets/sound/ost.mp3";

import RoutesProvider from "./Routes";
import DeleteAll from "./Delete";

function App() {
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

  return (
    <>
      <RoutesProvider />
    </>
  );
}

export default App;
