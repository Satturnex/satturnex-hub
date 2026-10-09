export default function Badge({ children, tone = "purple", className = "" }) {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
}
