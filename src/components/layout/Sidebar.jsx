import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Activity, Bell, CircleHelp, FolderKanban, Heart, LayoutDashboard, LogOut, Package, Settings, Orbit, MonitorCheck } from "lucide-react";
import Brand from "./Brand";
import ThemeSelect from "../ui/ThemeSelect";
import Avatar from "../ui/Avatar";
import Dropdown from "../ui/Dropdown";
import { useAuth } from "../../contexts/AuthContext";

const groups = [
  { label: "VISÃO GERAL", items: [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Atividade", to: "/activities", icon: Activity },
    { label: "Notificações", to: "/notifications", icon: Bell },
  ] },
  { label: "SATTURNEX", items: [
    { label: "Satturnex Hub", to: "/applications", icon: Orbit },
    { label: "Finance", to: "/applications?category=Dados", icon: Package },
    { label: "Systems", to: "/applications?category=Suporte", icon: MonitorCheck },
    { label: "Games", to: "/applications/projects", icon: FolderKanban },
    { label: "Labs", to: "/favorites", icon: Heart },
  ] },
  { label: "PREFERÊNCIAS", items: [ { label: "Configurações", to: "/settings", icon: Settings } ] },
];

export default function Sidebar({ collapsed = false, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("category");
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const itemIsActive = (label, isActive) => {
    if (label === "Satturnex Hub") return location.pathname === "/applications" && !location.search;
    if (label === "Finance") return location.pathname === "/applications" && category === "Dados";
    if (label === "Systems") return location.pathname === "/applications" && category === "Suporte";
    if (label === "Security") return location.pathname === "/admin/security";
    if (label === "Central de segurança" || label === "Sessões e dispositivos") return false;
    return isActive;
  };

  return <aside className={`sidebar ${collapsed ? "is-collapsed" : ""}`}>
    <div className="sidebar-brand"><Brand light/><span className="brand-caption">CENTRAL DE OPERAÇÕES</span></div>
    <nav className="sidebar-links" aria-label="Navegação principal">
      {groups.map(group => <section className="sidebar-group" key={group.label}><h2>{group.label}</h2>{group.items.map(({ label, to, icon: Icon }) => <NavLink key={label} to={to} end={to.split("?")[0] === "/dashboard" || label === "Satturnex Hub"} onClick={onNavigate} className={({ isActive }) => `sidebar-link ${itemIsActive(label, isActive) ? "active" : ""}`} title={collapsed ? label : undefined}><Icon size={17}/><span>{label}</span></NavLink>)}</section>)}
    </nav>
    <NavLink to="/settings" onClick={onNavigate} className="sidebar-help"><CircleHelp size={17}/><span>Ajuda e suporte</span></NavLink>
    <div className="sidebar-footer">
      <ThemeSelect/>
      <Dropdown label={<><Avatar name={user?.name || "Gustavo"} src={user?.avatar}/><span className="account-info"><strong>{user?.name || "Gustavo"}</strong><small><i/> Online</small></span></>}>
        <NavLink to="/settings" onClick={onNavigate}>Configurações da conta</NavLink>
        <button onClick={handleLogout}><LogOut size={14}/> Sair da conta</button>
      </Dropdown>
    </div>
  </aside>;
}
