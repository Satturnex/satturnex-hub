import { ArrowUpRight, Orbit } from "lucide-react";
import { Link } from "react-router-dom";

const ecosystemLinks = ["Satturnex Hub", "Satturnex Security", "Satturnex Finance", "Satturnex Banking", "Satturnex Systems", "Satturnex AI", "Satturnex Games", "Satturnex Labs"];

export default function Footer() {
  return <footer className="site-footer landing-footer"><div className="landing-container">
    <div className="footer-main"><div className="footer-brand-block"><Link to="/" className="brand" aria-label="Satturnex Hub, início"><span className="brand-mark"><Orbit size={20}/></span><span className="brand-name">SATTURNEX<small>HUB</small></span></Link><p>Technology. Security. Innovation.</p><span className="footer-manifesto">Uma visão conectada para as tecnologias do futuro.</span></div>
      <div className="footer-link-column"><h2>Ecossistema</h2>{ecosystemLinks.map((name,index)=><a key={name} href={index===0?"#hub":"#ecossistema"}>{name}</a>)}</div>
      <div className="footer-link-column"><h2>Satturnex</h2><a href="#sobre">Sobre</a><a href="#tecnologia">Tecnologia</a><Link to="/login">Acessar o Hub <ArrowUpRight size={13}/></Link></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Satturnex. Todos os direitos reservados.</span><a href="#top">Voltar ao topo ↑</a><span>Construído para conectar possibilidades.</span></div>
  </div></footer>;
}
