import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AuthCard from "../components/auth/AuthCard";
import Button from "../components/ui/Button";
import PasswordInput from "../components/auth/PasswordInput";

export function RecoverPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async event => {
    event.preventDefault(); setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Informe um endereço de e-mail válido."); return; }
    setLoading(true);
    try { await resetPassword(email); setSent(true); } catch (issue) { setError(issue.message || "Não foi possível solicitar a recuperação."); } finally { setLoading(false); }
  };
  return <AuthCard mode="login" heading={{ eyebrow: "RECUPERAÇÃO DE ACESSO", title: "Esqueceu sua senha?", description: "Enviaremos instruções para redefinir seu acesso." }} status={sent ? { kind: "success", title: "Verifique seu e-mail", message: "Se houver uma conta associada a esse endereço, você receberá instruções para redefinir a senha." } : null}>
    {!sent && <form className="auth-form" onSubmit={submit} noValidate><div className="auth-field"><label htmlFor="recovery-email">E-mail</label><div className="auth-input-wrap"><Mail size={17}/><input id="recovery-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required/></div></div>{error && <p className="auth-error" role="alert">{error}</p>}<Button type="submit" disabled={loading} className="auth-submit">{loading ? "Enviando..." : "Enviar instruções"}</Button><p className="auth-switch"><Link to="/login">Voltar ao login</Link></p></form>}
  </AuthCard>;
}

export function ResetPassword() {
  const { setPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPasswordValue] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async event => {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    if (password !== confirmation) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    try { await setPassword(password); setDone(true); } catch (issue) { setError(issue.message || "Link de redefinição inválido ou expirado. Solicite outro link."); } finally { setLoading(false); }
  };
  return <AuthCard mode="login" heading={{ eyebrow: "NOVA SENHA", title: "Redefina sua senha", description: "Escolha uma senha segura para sua conta." }} status={done ? { kind: "success", title: "Senha atualizada", message: "Sua senha foi alterada com sucesso.", action: <Button className="auth-submit" onClick={() => navigate("/dashboard", { replace: true })}>Continuar</Button> } : null}>
    {!done && <form className="auth-form" onSubmit={submit} noValidate><PasswordInput id="new-password" label="Nova senha" value={password} onChange={event => setPasswordValue(event.target.value)} autoComplete="new-password"/><PasswordInput id="confirm-new-password" label="Confirmar senha" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="new-password"/>{error && <p className="auth-error" role="alert">{error}</p>}<Button type="submit" disabled={loading} className="auth-submit">{loading ? "Atualizando..." : "Salvar nova senha"}</Button></form>}
  </AuthCard>;
}
