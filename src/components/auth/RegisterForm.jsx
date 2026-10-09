import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, UserRound } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import PasswordInput from "./PasswordInput";
import PasswordStrength, { passwordStrength } from "./PasswordStrength";

export default function RegisterForm({ setStatus }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const next = {};
    if (name.trim().length < 2) next.name = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Informe um endereço de e-mail válido.";
    if (password.length < 8 || passwordStrength(password) < 3) next.password = "Escolha uma senha com 8+ caracteres, letras e números.";
    if (confirmation !== password) next.confirmation = "As senhas não coincidem.";
    setErrors(next); return Object.keys(next).length === 0;
  };
  const submit = async event => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { const result = await register({ name, email, password }); setStatus({ kind: "success", title: result.session ? "Conta criada" : "Confirme seu e-mail", message: result.session ? "Sua conta foi criada e você já pode acessar o Hub." : "Se o endereço puder ser cadastrado, enviaremos um link de confirmação. Confirme seu e-mail e depois entre no Hub." }); }
    catch (issue) { setErrors({ form: issue.message || "Não foi possível criar sua conta." }); }
    finally { setLoading(false); }
  };
  return <form className="auth-form register-form" onSubmit={submit} noValidate>
    <div className="auth-field"><label htmlFor="full-name">Nome completo</label><div className="auth-input-wrap"><UserRound size={17}/><input id="full-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} onBlur={() => name && setErrors(current => ({ ...current, name: name.trim().length < 2 ? "Informe seu nome completo." : "" }))} placeholder="Como podemos chamar você?" required aria-invalid={Boolean(errors.name)}/></div>{errors.name && <span className="auth-field-error">{errors.name}</span>}</div>
    <div className="auth-field"><label htmlFor="register-email">E-mail</label><div className="auth-input-wrap"><Mail size={17}/><input id="register-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@empresa.com" required aria-invalid={Boolean(errors.email)}/></div>{errors.email && <span className="auth-field-error">{errors.email}</span>}</div>
    <PasswordInput id="register-password" label="Senha" value={password} onChange={event => setPassword(event.target.value)} onBlur={() => password && setErrors(current => ({ ...current, password: password.length < 8 || passwordStrength(password) < 3 ? "Escolha uma senha com 8+ caracteres, letras e números." : "" }))} autoComplete="new-password" error={errors.password}/>
    <PasswordStrength value={password}/>
    <PasswordInput id="confirm-password" label="Confirmar senha" value={confirmation} onChange={event => setConfirmation(event.target.value)} onBlur={() => confirmation && setErrors(current => ({ ...current, confirmation: confirmation !== password ? "As senhas não coincidem." : "" }))} autoComplete="new-password" error={errors.confirmation}/>
    {errors.form && <p className="auth-error" role="alert">{errors.form}</p>}
    <Button type="submit" disabled={loading} className="auth-submit">{loading ? <><span className="spinner"/> Criando sua conta...</> : "Criar conta"}</Button>
    <p className="auth-switch">Já possui uma conta? <Link to="/login">Entrar</Link></p>
  </form>;
}
