import React from "react";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const Controls = ({ minZoom, scale, handleZoom }) => {

  return (
    <div className="controls">
      <ZoomOutIcon style={{ color: 'white' }} />
      <input type="range" min={minZoom} max="1.5" step="0.1" value={scale} onChange={handleZoom} />
      <ZoomInIcon style={{ color: 'white' }} />
    </div>
  );
};

export default Controls;
