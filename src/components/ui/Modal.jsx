import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => { if (event.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(<div className="modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={16}/></button></header><div>{children}</div></section></div>, document.body);
}
