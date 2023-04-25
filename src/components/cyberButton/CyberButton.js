import "./CyberButton.css";

export default function CyberButton({ message, onClick, turn }) {
  return (
    <>
      <button className="cyberpunk2077 blue" onClick={onClick} style={{ "--button-label": `"${turn}"` }}>
        {message}
      </button>
    </>
  );
}
