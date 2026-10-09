import { useState } from "react";
import { Bell, KeyRound, Laptop, MonitorCog, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import ThemeSelect from "../components/ui/ThemeSelect";
import Avatar from "../components/ui/Avatar";

const tabs = [
  { id: "profile", label: "Perfil", icon: UserRound },
  { id: "appearance", label: "Aparência", icon: MonitorCog },
  { id: "preferences", label: "Preferências", icon: Bell },
  { id: "security", label: "Segurança", icon: ShieldCheck },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { preference, setPreference } = useTheme();
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [profileError, setProfileError] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("satturnex-language") || "Português (Brasil)");
  const [emailNotices, setEmailNotices] = useState(() => localStorage.getItem("satturnex-email-notices") !== "false");
  const feedback = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2500); };
  const saveProfile = async event => { event.preventDefault(); setProfileError(""); try { const updated = await updateUser({ name, email, avatar }); if (updated.emailChangePending) setProfileError("Enviamos uma solicitação de confirmação para o novo endereço. O e-mail atual permanece até a confirmação."); feedback(); } catch (issue) { setProfileError(issue.message || "Não foi possível salvar o perfil."); } };
  const readAvatar = event => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith("image/")) { setProfileError("Escolha um arquivo de imagem."); return; } if (file.size > 1024 * 1024) { setProfileError("A imagem deve ter até 1 MB."); return; } const reader = new FileReader(); reader.onload = () => setAvatar(String(reader.result)); reader.readAsDataURL(file); };
  const savePreferences = () => { localStorage.setItem("satturnex-language", language); localStorage.setItem("satturnex-email-notices", String(emailNotices)); feedback(); };

  return <>
    <PageHeader eyebrow="PREFERÊNCIAS DO PORTAL" title="Configurações" description="Personalize sua experiência no Satturnex Hub."/>
    <div className="settings-layout">
      <nav className="settings-tabs" aria-label="Seções de configurações">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={16}/>{label}</button>)}</nav>
      <div className="settings-panel">
        {tab === "profile" && <Card className="settings-card"><h2>Perfil</h2><p>Atualize as informações básicas da sua conta.</p><form onSubmit={saveProfile}><Input id="settings-name" label="Nome" value={name} onChange={event => setName(event.target.value)} required/><Input id="settings-email" label="E-mail" type="email" value={email} onChange={event => setEmail(event.target.value)} required/><div className="settings-avatar-row"><Avatar name={name} src={avatar} size="lg"/><div><strong>Avatar</strong><small>Imagem JPG, PNG ou GIF de até 1 MB.</small></div><label className="button button-outline avatar-upload">Alterar<input type="file" accept="image/*" onChange={readAvatar} aria-label="Escolher imagem de avatar"/></label></div>{profileError && <p className="form-error" role="alert">{profileError}</p>}<div className="settings-actions"><span className="save-feedback" role="status">{saved ? "Alterações salvas." : ""}</span><button className="button button-primary">Salvar alterações</button></div></form></Card>}
        {tab === "appearance" && <Card className="settings-card"><h2>Aparência</h2><p>Escolha como o Satturnex Hub será exibido neste dispositivo.</p><div className="theme-options">{[{ id: "light", label: "Claro", icon: Sun }, { id: "dark", label: "Escuro", icon: Moon }, { id: "system", label: "Sistema", icon: Laptop }].map(({ icon: Icon, ...item }) => <button key={item.id} className={`theme-option ${preference === item.id ? "selected" : ""}`} onClick={() => setPreference(item.id)}><span><Icon size={17}/></span><strong>{item.label}</strong><small>{item.id === "system" ? "Seguir preferência do dispositivo" : item.id === "dark" ? "Tons escuros e contraste suave" : "Tons claros e superfícies suaves"}</small></button>)}</div><div className="settings-preview-row"><span>Seletor rápido</span><ThemeSelect/></div></Card>}
        {tab === "preferences" && <Card className="settings-card"><h2>Preferências</h2><p>Gerencie notificações e idioma do portal.</p><label className="preference-row"><span><strong>Notificações por e-mail</strong><small>Receber atualizações importantes da plataforma.</small></span><input type="checkbox" checked={emailNotices} onChange={event => setEmailNotices(event.target.checked)}/></label><label className="field setting-language"><span>Idioma</span><select value={language} onChange={event => setLanguage(event.target.value)}><option>Português (Brasil)</option><option>English</option><option>Español</option></select></label><div className="settings-actions"><span className="save-feedback" role="status">{saved ? "Preferências salvas." : ""}</span><button className="button button-primary" onClick={savePreferences}>Salvar preferências</button></div></Card>}
        {tab === "security" && <Card className="settings-card"><h2>Segurança e acesso</h2><p>Opções de segurança estarão disponíveis quando a autenticação real estiver conectada.</p>{[{ icon: KeyRound, title: "Alterar senha", text: "Gerencie as credenciais da sua conta." }, { icon: MonitorCog, title: "Sessões ativas", text: "Veja os dispositivos conectados." }, { icon: ShieldCheck, title: "Autenticação em dois fatores", text: "Adicione uma camada extra de proteção." }].map(({ icon: Icon, title, text }) => <div className="security-option" key={title}><span className="settings-icon"><Icon size={18}/></span><span><strong>{title}</strong><small>{text}</small></span><button className="button button-outline" disabled>Em breve</button></div>)}</Card>}
      </div>
    </div>
  </>;
}
