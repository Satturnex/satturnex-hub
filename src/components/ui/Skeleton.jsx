export default function Skeleton({ width = "100%", height = 16, className = "" }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" style={{ width, height }}/>
}
