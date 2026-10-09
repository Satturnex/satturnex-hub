import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";
import Button from "../ui/Button";
import ThemeSelect from "../ui/ThemeSelect";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = event => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <header className={`site-header landing-header${scrolled ? " is-scrolled" : ""}`}>
    <div className="nav-wrap"><Brand />
      <button className="mobile-menu-toggle" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(value => !value)}>{open ? <X/> : <Menu/>}</button>
      <nav id="main-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Navegação principal">
        <a href="#hub" onClick={close}>Hub</a><a href="#ecossistema" onClick={close}>Ecossistema</a><a href="#tecnologia" onClick={close}>Tecnologia</a><a href="#sobre" onClick={close}>Sobre</a>
        <div className="nav-theme"><ThemeSelect compact/></div>
        <Button to="/login" variant="outline" className="nav-cta" onClick={close}>Entrar <span aria-hidden="true">↗</span></Button>
      </nav>
    </div>
  </header>;
}
