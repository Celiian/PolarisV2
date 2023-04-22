import React from "react";

const Controls = ({ minZoom, scale, handleZoom }) => (
  <div className="controls">
    <input type="range" min={minZoom} max="1.5" step="0.1" value={scale} onChange={handleZoom} />
  </div>
);

export default Controls;
