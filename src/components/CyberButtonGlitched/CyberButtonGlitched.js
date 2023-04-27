import "./CyberButtonGlitched.css";

export default function CyberButtonGlitched({ message, onClick, color }) {
  return (
    <>
      <button
        className="cybr-btn"
        onClick={onClick}
        style={{ backgroundColor: color }}
      >
        {message}
        <span aria-hidden="">_</span>
        <span aria-hidden class="cybr-btn__glitch">
          {message}_
        </span>
        <span aria-hidden class="cybr-btn__tag">
          R25
        </span>
      </button>
    </>
  );
}
