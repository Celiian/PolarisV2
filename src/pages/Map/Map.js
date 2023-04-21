import React, { useState, useEffect } from "react";
import { HexGrid, Layout, Hexagon } from "react-hexgrid";

function Map() {
  const hexagonCount = 1000;
  const hexagons = [];
  const [viewBox, setViewBox] = useState("-50 -50 100 100");
  const [speed, setSpeed] = useState(10);
  const [scale, setScale] = useState(0.6);

  const handleKeyDown = (event) => {
    const { keyCode } = event;
    let newViewBox = viewBox;

    switch (keyCode) {
      case 37: // Left arrow key
        newViewBox = `${parseFloat(viewBox.split(" ")[0]) - speed} ${viewBox.split(" ")[1]} ${viewBox.split(" ")[2]} ${
          viewBox.split(" ")[3]
        }`;
        break;
      case 38: // Up arrow key
        newViewBox = `${viewBox.split(" ")[0]} ${parseFloat(viewBox.split(" ")[1]) - speed} ${viewBox.split(" ")[2]} ${
          viewBox.split(" ")[3]
        }`;
        break;
      case 39: // Right arrow key
        newViewBox = `${parseFloat(viewBox.split(" ")[0]) + speed} ${viewBox.split(" ")[1]} ${viewBox.split(" ")[2]} ${
          viewBox.split(" ")[3]
        }`;
        break;
      case 40: // Down arrow key
        newViewBox = `${viewBox.split(" ")[0]} ${parseFloat(viewBox.split(" ")[1]) + speed} ${viewBox.split(" ")[2]} ${
          viewBox.split(" ")[3]
        }`;
        break;
      default:
        break;
    }

    setViewBox(newViewBox);
  };

  const handleZoom = (event) => {
    const newZoom = event.target.value;
    const centerX = parseFloat(viewBox.split(" ")[0]) + parseFloat(viewBox.split(" ")[2]) / 2;
    const centerY = parseFloat(viewBox.split(" ")[1]) + parseFloat(viewBox.split(" ")[3]) / 2;
    const newWidth = 100 / newZoom;
    const newHeight = 100 / newZoom;
    setScale(newZoom);
    const newViewBox = `${centerX - newWidth / 2} ${centerY - newHeight / 2} ${newWidth} ${newHeight}`;
    setViewBox(newViewBox);
  };

  const handleMouseDown = (event) => {
    const startX = event.clientX;
    const startY = event.clientY;

    const handleMouseMove = (event) => {
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      setViewBox(
        `${parseFloat(viewBox.split(" ")[0]) - deltaX} ${parseFloat(viewBox.split(" ")[1]) - deltaY} ${
          viewBox.split(" ")[2]
        } ${viewBox.split(" ")[3]}`
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewBox, speed]);

  const handleClick = (event, q, r, s) => {
    console.log(`Clicked hexagon at q:${q}, r:${r}, s:${s}`);
  };
  var map_size = 50;
  var minZoom = 0.2 / (map_size / 10);
  for (let q = -map_size; q <= map_size; q++) {
    const r1 = Math.max(-map_size, -q - map_size);
    const r2 = Math.min(map_size, -q + map_size);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      const hexagon = <Hexagon q={q} r={r} s={s} key={`${q}-${r}-${s}`} onClick={() => handleClick(q, r, s)} />;
      hexagons.push(hexagon);
    }
  }
  return (
    <div>
      <div className="controls">
        <input type="range" min={minZoom} max="1.5" step="0.1" value={scale} onChange={handleZoom} />
      </div>
      <HexGrid width={1200} height={800} viewBox={viewBox}>
        <Layout size={{ x: 12, y: 12 }} flat={false} spacing={1.15} origin={{ x: -6, y: -6 }}>
          {hexagons}
        </Layout>
      </HexGrid>
    </div>
  );
}

export default Map;
