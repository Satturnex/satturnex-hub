import { Check, CircleAlert, Info, X } from "lucide-react";
const icons = { info: Info, success: Check, error: CircleAlert };
export default function Toast({ type = "info", message, onClose }) {
  const Icon = icons[type] || Info;
  return <div className={`toast toast-${type}`} role="status"><Icon size={17}/><span>{message}</span><button aria-label="Fechar aviso" onClick={onClose}><X size={15}/></button></div>;
}
