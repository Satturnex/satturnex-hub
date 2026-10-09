import { ChevronDown } from "lucide-react";

export default function Dropdown({ label, children }) {
  return <details className="dropdown"><summary>{label}<ChevronDown size={14}/></summary><div className="dropdown-menu">{children}</div></details>;
}
