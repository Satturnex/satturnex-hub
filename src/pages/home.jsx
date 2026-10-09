import { ArrowDown, ArrowRight, Bot, Cpu, Layers3, Orbit, ShieldCheck, Sparkles, WalletCards, Workflow } from "lucide-react";
import Button from "../components/ui/Button";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import AmbientBackground from "../components/layout/AmbientBackground";
import Ecosystem from "../components/landing/Ecosystem";
import { Reveal } from "../components/landing/Reveal";
import "../styles/landing.css";
import "../styles/landing-tuning.css";

const capabilities = [
  { icon: ShieldCheck, name: "Security", detail: "Proteção desde a base" },
  { icon: Bot, name: "Inteligência artificial", detail: "Automação e agentes" },
  { icon: Layers3, name: "Cloud & systems", detail: "Plataformas conectadas" },
  { icon: Workflow, name: "Automação", detail: "Fluxos mais eficientes" },
];

function Hero() {
  return <section className="landing-hero" id="hub">
    <div className="landing-hero-grid" aria-hidden="true" />
    <div className="landing-hero-orbit" aria-hidden="true"><span/><i/><b/></div>
    <div className="landing-container landing-hero-content">
      <Reveal className="landing-hero-copy">
        <div className="landing-kicker"><span className="live-dot"/> O núcleo do ecossistema Satturnex</div>
        <h1><span className="hero-brand">SATTURNEX</span><span className="hero-hub">Hub<span>.</span></span></h1>
        <p className="landing-lead">O ecossistema que conecta <strong>tecnologia, segurança, sistemas e inovação.</strong></p>
        <p className="landing-sublead">Um ponto de partida para conhecer as frentes e soluções que estamos construindo sob a marca Satturnex.</p>
        <div className="landing-actions"><Button href="#ecossistema">Explorar ecossistema <ArrowRight size={16}/></Button><Button href="#sobre" variant="outline">Conhecer a Satturnex</Button></div>
        <a className="landing-scroll" href="#ecossistema"><span><ArrowDown size={14}/></span> Descubra o que nos conecta</a>
      </Reveal>
      <Reveal className="hub-visual" delay={120}>
        <div className="hub-visual-glow"/>
        <div className="hub-orbit orbit-outer"><i/></div><div className="hub-orbit orbit-inner"><i/></div>
        <div className="hub-connector connector-a"/><div className="hub-connector connector-b"/><div className="hub-connector connector-c"/><div className="hub-connector connector-d"/>
        <div className="hub-node node-security"><ShieldCheck/><span>Security</span></div><div className="hub-node node-ai"><Bot/><span>AI</span></div><div className="hub-node node-systems"><Cpu/><span>Systems</span></div><div className="hub-node node-finance"><WalletCards/><span>Finance</span></div>
        <div className="hub-core"><span className="hub-core-mark"><Orbit size={26}/></span><strong>SATTURNEX</strong><small>HUB · CONECTADO</small></div>
        <div className="hub-visual-label"><span className="live-dot"/> Uma visão. Múltiplas frentes.</div>
      </Reveal>
    </div>
    <div className="landing-container hero-trust-row"><span>TECNOLOGIA COM IDENTIDADE PRÓPRIA</span><i/><span>FEITO PARA CRESCER</span><i/><span>UM ECOSSISTEMA EM CONSTRUÇÃO</span></div>
  </section>;
}

function About() {
  return <section className="landing-section about-landing" id="sobre"><div className="landing-container about-layout">
    <Reveal className="about-statement"><span className="landing-eyebrow">A visão Satturnex</span><h2>Mais do que produtos.<br/><em>Um ecossistema.</em></h2></Reveal>
    <Reveal className="about-description" delay={100}><p>A Satturnex busca desenvolver tecnologias conectadas em diferentes áreas. O Hub é a porta de entrada para essa visão: um lugar para reunir iniciativas, explorar novas possibilidades e evoluir cada frente com uma identidade em comum.</p><div className="about-signature"><span className="signature-mark"><Orbit size={18}/></span><span><strong>Uma marca. Muitas possibilidades.</strong><small>Conheça as frentes Satturnex</small></span><ArrowRight size={16}/></div></Reveal>
  </div></section>;
}

function Technology() {
  return <section className="landing-section technology-section" id="tecnologia"><div className="landing-container"><Reveal className="landing-section-heading"><div><span className="landing-eyebrow">Built for the future</span><h2>Tecnologia pensada<br/><em>para evoluir.</em></h2></div><p>Uma base multidisciplinar para criar soluções que funcionam melhor quando trabalham juntas.</p></Reveal>
    <div className="capability-grid">{capabilities.map(({icon:Icon,name,detail},index)=><Reveal key={name} delay={index*55}><article className="capability-card"><span className="capability-icon"><Icon size={19}/></span><span className="capability-index">0{index+1}</span><h3>{name}</h3><p>{detail}</p><span className="capability-line"/></article></Reveal>)}</div>
  </div></section>;
}

function ClosingCta() {
  return <section className="landing-cta" id="acesso"><div className="landing-container"><div className="landing-cta-panel"><div className="cta-decoration"><Sparkles size={20}/></div><div><span className="landing-eyebrow">Seu espaço Satturnex</span><h2>Uma plataforma.<br/><em>Muitas possibilidades.</em></h2><p>Acesse o Hub para acompanhar os sistemas e recursos disponíveis.</p></div><Button to="/login">Acessar o Hub <ArrowRight size={16}/></Button></div></div></section>;
}

export default function Home() {
  return <div className="home landing-page" id="top"><a className="skip-link" href="#main-content">Pular para o conteúdo</a><AmbientBackground/><Navbar/><main id="main-content"><Hero/><Ecosystem/><About/><Technology/><ClosingCta/></main><Footer/></div>;
}
