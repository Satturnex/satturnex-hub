import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({ id, label, value, onChange, autoComplete, error, onBlur }) {
  const [visible, setVisible] = useState(false);
  return <div className={`auth-field ${error ? "has-error" : ""}`}>
    <label htmlFor={id}>{label}</label>
    <div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true"/><input id={id} type={visible ? "text" : "password"} value={value} onChange={onChange} onBlur={onBlur} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} placeholder="••••••••" required minLength={8}/><button type="button" className="password-toggle" onClick={() => setVisible(state => !state)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
    {error && <span id={`${id}-error`} className="auth-field-error">{error}</span>}
  </div>;
}
