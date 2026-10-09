import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AmbientBackground from "./AmbientBackground";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-menu-open" : ""}`}><AmbientBackground/><Sidebar collapsed={collapsed} onNavigate={() => setMobileOpen(false)}/><button className="mobile-backdrop" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}/><div className="app-main"><Topbar onToggleSidebar={() => window.matchMedia("(max-width: 840px)").matches ? setMobileOpen(value => !value) : setCollapsed(value => !value)}/><main className="page-content"><div key={location.pathname} className="route-transition"><Outlet/></div></main></div></div>;
}
