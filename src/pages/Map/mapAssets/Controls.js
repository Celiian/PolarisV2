import React from "react";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const Controls = ({ minZoom, scale, handleZoom, setScale }) => {
  return (
    <div className="controls">
      <ZoomOutIcon
        style={{ color: "white" }}
        onClick={() => {
          if (scale > 0.2) {
            var newScale = parseFloat(scale);
            setScale(newScale - 0.1);
          } else if (scale > 0.1) {
            var newScale = parseFloat(scale);
            setScale(newScale - 0.05);
          }
        }}
      />
      <input type="range" min={minZoom} max="1.2" step="0.1" value={scale} onChange={handleZoom} />
      <ZoomInIcon
        style={{ color: "white" }}
        onClick={() => {
          if (scale < 1.1) {
            var newScale = parseFloat(scale);

            setScale((newScale += 0.1));
          }
        }}
      />
    </div>
  );
};

export default Controls;
