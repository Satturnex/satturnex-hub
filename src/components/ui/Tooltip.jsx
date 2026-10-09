export default function Tooltip({ text, children }) {
  return <span className="tooltip-wrap" data-tooltip={text}>{children}<span role="tooltip">{text}</span></span>;
}
