import { ArrowLeft, Check, CircleAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AuthBackground from "./AuthBackground";
import AuthLogo from "./AuthLogo";
import ThemeSelect from "../ui/ThemeSelect";

export default function AuthCard({ mode, children, status, heading }) {
  const register = mode === "register";
  return <main className="auth-page">
    <AuthBackground/>
    <header className="auth-topbar"><Link to="/" className="auth-back"><ArrowLeft size={16}/> Voltar ao portal</Link><ThemeSelect/></header>
    <div className="auth-layout">
      <aside className="auth-story"><div className="auth-story-orbit"><span/><i/><b/></div><div className="auth-story-copy"><span className="auth-kicker"><i/> SEU ECOSSISTEMA, EM UM SÓ LUGAR</span><h2>O próximo passo<br/>começa <em>aqui.</em></h2><p>Entre no Satturnex Hub e acompanhe as ferramentas e iniciativas que conectam nosso ecossistema.</p><div className="auth-trust"><ShieldCheck size={17}/><span>Acesso protegido ao seu espaço Satturnex</span></div></div><div className="auth-story-foot">TECNOLOGIA COM IDENTIDADE PRÓPRIA <i/> SATTURNEX HUB</div></aside>
      <section className={`auth-card ${register ? "auth-card-register" : ""}`} key={mode}>
        <AuthLogo/>
        {status ? <div className="auth-status" role="status"><span className="auth-status-icon">{status.kind === "success" ? <Check size={21}/> : <CircleAlert size={21}/>}</span><h1>{status.title}</h1><p>{status.message}</p>{status.action}</div> : <>
          <div className="auth-heading"><span className="auth-eyebrow">{heading?.eyebrow || (register ? "FAÇA PARTE DO ECOSSISTEMA" : "ACESSO AO PORTAL")}</span><h1>{heading?.title || (register ? "Crie sua conta" : "Bem-vindo de volta")}</h1><p>{heading?.description || (register ? "Um único acesso para explorar o universo Satturnex." : "Acesse seu espaço e continue de onde parou.")}</p></div>
          {children}
          <p className="auth-privacy"><ShieldCheck size={14}/> Seus dados são tratados com cuidado.</p>
        </>}
      </section>
    </div>
    <footer className="auth-footer"><span>© {new Date().getFullYear()} Satturnex Hub</span><span>UM ECOSSISTEMA EM EVOLUÇÃO</span></footer>
  </main>;
}
