import { ArrowUpRight, Bot, Building2, Gamepad2, FlaskConical, Layers3, Orbit, ShieldCheck, WalletCards } from "lucide-react";
import { Reveal } from "./Reveal";

const products = [
  { icon: Orbit, name: "Satturnex Hub", description: "O centro do ecossistema Satturnex.", status: "Plataforma central", href: "/login", action: "Acessar o Hub", featured: true },
  { icon: ShieldCheck, name: "Satturnex Security", description: "Segurança cibernética, proteção digital e infraestrutura segura.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: WalletCards, name: "Satturnex Finance", description: "Tecnologia aplicada à segurança e gestão financeira.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: Building2, name: "Satturnex Banking", description: "Soluções e tecnologias voltadas ao ambiente bancário.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: Layers3, name: "Satturnex Systems", description: "Sistemas, plataformas e soluções digitais.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: Bot, name: "Satturnex AI", description: "Inteligência artificial, automação e agentes inteligentes.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: Gamepad2, name: "Satturnex Games", description: "Jogos, experiências interativas e projetos de entretenimento.", status: "Frente do ecossistema", action: "Conhecer a visão" },
  { icon: FlaskConical, name: "Satturnex Labs", description: "Pesquisa, experimentação e novas tecnologias.", status: "Frente do ecossistema", action: "Conhecer a visão" },
];

function EcosystemCard({ product, index }) {
  const { icon: Icon, name, description, status, action, href, featured } = product;
  return <Reveal className="ecosystem-card-reveal" delay={index * 45}><article className={`ecosystem-card${featured ? " ecosystem-card-featured" : ""}`}>
    <div className="ecosystem-card-top"><span className="ecosystem-card-icon"><Icon size={20}/></span><span className="ecosystem-card-number">0{index + 1}</span></div>
    <span className="ecosystem-card-status"><i/> {status}</span>
    <h3>{name}</h3><p>{description}</p>
    <a className="ecosystem-card-link" href={href || "#sobre"}>{action}<ArrowUpRight size={15}/></a>
  </article></Reveal>;
}

export default function Ecosystem() {
  return <section className="landing-section ecosystem-landing" id="ecossistema"><div className="landing-container">
    <Reveal className="landing-section-heading ecosystem-heading"><div><span className="landing-eyebrow">Uma marca. Oito frentes.</span><h2>Ecossistema<br/><em>Satturnex.</em></h2></div><p>Conheça as áreas que formam o universo Satturnex. Cada frente tem sua especialidade e compartilha a mesma visão de tecnologia.</p></Reveal>
    <div className="ecosystem-grid">{products.map((product,index)=><EcosystemCard key={product.name} product={product} index={index}/>)}</div>
    <div className="ecosystem-footnote"><span><i/> O ecossistema está em evolução contínua</span><span><Orbit size={15}/> SATTURNEX · CONNECTED BY DESIGN</span></div>
  </div></section>;
}
