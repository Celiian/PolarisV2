import "./CyberButton.css";

export default function CyberButton({ message, onClick, turn, color }) {
  return (
    <>
      <button className={"cyberpunk2077 " + color} onClick={onClick} style={{ "--button-label": `"${turn}"` }}>
        {message}
      </button>
    </>
  );
}
