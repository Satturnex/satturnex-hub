import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeSelect from "../ui/ThemeSelect";
import Avatar from "../ui/Avatar";
import { notificationsService } from "../../services/notificationsService";

const labels = { dashboard: "Dashboard", applications: "Aplicações", activities: "Atividade", favorites: "Favoritos", notifications: "Notificações", settings: "Configurações", admin: "Administração", users: "Usuários", team: "Equipe", permissions: "Permissões", organizations: "Organizações", clients: "Clientes", security: "Segurança", audit: "Auditoria", integrations: "Integrações", health: "Saúde da plataforma" };
export default function Topbar({ onToggleSidebar }) {
  const { user } = useAuth(); const location = useLocation(); const navigate = useNavigate(); const [query, setQuery] = useState(""); const [unread, setUnread] = useState(0); const searchRef = useRef(null);
  useEffect(() => { const refresh = () => notificationsService.list().then(items => setUnread(items.filter(item => !item.read).length)); refresh(); window.addEventListener("satturnex:notifications", refresh); return () => window.removeEventListener("satturnex:notifications", refresh); }, []);
  useEffect(() => {
    const onKeyDown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const current = location.pathname.split("/").filter(Boolean); const crumbs = current.map((part, index) => ({ label: labels[part] || (index === 1 ? "Detalhes" : part), path: `/${current.slice(0, index + 1).join("/")}` }));
  return <header className="topbar"><button className="icon-button sidebar-toggle" onClick={onToggleSidebar} aria-label="Recolher ou expandir menu"><Menu size={18}/></button><nav className="breadcrumbs" aria-label="Navegação estrutural"><Link to="/dashboard">Hub</Link>{crumbs.map(crumb => <span className="crumb" key={crumb.path}><ChevronRight size={13}/><span>{crumb.label}</span></span>)}</nav><div className="topbar-tools"><label className="global-search"><Search size={16}/><input ref={searchRef} value={query} onKeyDown={event => { if (event.key === "Enter" && query.trim()) navigate(`/applications?search=${encodeURIComponent(query.trim())}`); }} onChange={event => setQuery(event.target.value)} placeholder="Buscar no Hub..." aria-label="Busca global"/><kbd>Ctrl K</kbd></label><Link className="icon-button topbar-notification" to="/notifications" aria-label={`Notificações, ${unread} não lidas`}><Bell size={17}/>{unread > 0 && <i>{unread}</i>}</Link><ThemeSelect compact/><span className="topbar-avatar"><Avatar name={user?.name} src={user?.avatar}/></span></div></header>;
}
