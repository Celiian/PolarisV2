import "./CyberButtonGlitched.css";

export default function CyberButtonGlitched({ message, onClick, color }) {
  return (
    <>
      <button
        className="cybr-btn"
        onClick={() => onClick()}
        style={{ backgroundColor: color }}
      >
        {message}
        <span aria-hidden="true">_</span>
        <span aria-hidden className="cybr-btn__glitch">
          {message}_
        </span>
      </button>
    </>
  );
}
