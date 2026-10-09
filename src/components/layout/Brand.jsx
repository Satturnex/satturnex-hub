import { Link } from "react-router-dom";
import { Orbit } from "lucide-react";

export default function Brand({ light = false }) {
  return <Link to="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="Satturnex Hub, início"><span className="brand-mark"><Orbit size={20} strokeWidth={2.2} /></span><span className="brand-name">SATTURNEX<small>HUB</small></span></Link>;
}
