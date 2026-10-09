import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import PasswordInput from "./PasswordInput";

export default function LoginForm({ setStatus }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const destination = location.state?.from;
  const candidate = destination?.pathname
    ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
    : destination || "/dashboard";
  const returnTo = candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/dashboard";
  const submit = async event => {
    event.preventDefault(); setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Informe um endereço de e-mail válido."); return; }
    if (!password) { setError("Informe sua senha para continuar."); return; }
    setLoading(true);
    try { await login({ email, password }); setStatus({ kind: "success", title: "Acesso autorizado", message: "Seu espaço Satturnex está pronto.", action: null }); window.setTimeout(() => navigate(returnTo, { replace: true }), 850); }
    catch (issue) { setError(issue.message || "Não foi possível entrar. Tente novamente."); }
    finally { setLoading(false); }
  };
  return <form className="auth-form" onSubmit={submit} noValidate>
    <div className="auth-field"><label htmlFor="email">E-mail</label><div className="auth-input-wrap"><Mail size={17} aria-hidden="true"/><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@empresa.com" required aria-invalid={Boolean(error && !email.includes("@"))}/></div></div>
    <PasswordInput id="password" label="Senha" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password"/>
    <div className="auth-options"><span/><Link to="/recover-password">Esqueci minha senha</Link></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <Button type="submit" disabled={loading} className="auth-submit">{loading ? <><span className="spinner"/> Autenticando...</> : "Entrar"}</Button>
    <p className="auth-switch">Ainda não tem uma conta? <Link to="/register">Criar uma conta</Link></p>
  </form>;
}
