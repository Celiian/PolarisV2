import "./CyberButton.css";

export default function CyberButton({ message, onClick, toolTip, style }) {
  return (
    <>
      <button className={"cyberpunk2077 " + style} onClick={onClick} style={{ "--button-label": `"${toolTip}"` }}>
        {message}
      </button>
    </>
  );
}
