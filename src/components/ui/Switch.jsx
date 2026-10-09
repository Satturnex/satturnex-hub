export default function Switch({ checked, onChange, label }) {
  return <button className={`switch ${checked ? "is-on" : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span/></button>;
}
