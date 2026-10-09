import { useEffect, useState } from "react";
import { AppWindow, ArrowRight, Bell, CheckCircle2, FolderKanban, Orbit, ShieldCheck, Server, Gauge, CircleDashed } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { activities } from "../data/activities";
import { applications } from "../data/applications";
import { notificationsService } from "../services/notificationsService";
import { useAuth } from "../contexts/AuthContext";

function ActivityPanel() {
  return <Card className="panel"><div className="panel-head"><div><h2>Atividade recente</h2><span className="overview-subtitle">Últimas atualizações do portal</span></div><Link to="/activities">Ver todas <ArrowRight size={13}/></Link></div><div className="activity-list">{activities.slice(0, 3).map(item => <div className="activity-item" key={item.id}><span className="activity-symbol"><Orbit size={15}/></span><span className="activity-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="activity-time">{item.time}</span></div>)}</div></Card>;
}

function ShortcutsPanel() {
  const shortcuts = [
    { to: "/applications", icon: AppWindow, title: "Explorar aplicações", detail: "Veja as ferramentas disponíveis" },
    { to: "/favorites", icon: CheckCircle2, title: "Seus favoritos", detail: "Acesse suas aplicações salvas" },
    { to: "/notifications", icon: Bell, title: "Central de notificações", detail: "Acompanhe avisos e atualizações" },
  ];
  return <Card className="panel dashboard-shortcuts"><div className="panel-head"><div><h2>Acesso rápido</h2><span className="overview-subtitle">Continue de onde parou</span></div></div>{shortcuts.map(({ to, icon: Icon, title, detail }) => <Link to={to} className="shortcut-row" key={to}><span className="shortcut-icon"><Icon size={17}/></span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={15}/></Link>)}</Card>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const refresh = () => notificationsService.list().then(items => setUnread(items.filter(item => !item.read).length));
    refresh();
    window.addEventListener("satturnex:notifications", refresh);
    return () => window.removeEventListener("satturnex:notifications", refresh);
  }, []);

  return <>
    <PageHeader eyebrow="SATTURNEX CONTROL CENTER · VISÃO GERAL" title={`Bem-vindo${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`} description="O centro de controle que conecta os sistemas e operações Satturnex." action={<span className="demo-badge"><CircleDashed size={14}/> Visão demonstrativa</span>}/>
    <section className="control-banner"><div className="control-banner-copy"><span className="control-eyebrow"><i/> CONTROL CENTER</span><h2>Uma visão unificada do ecossistema Satturnex.</h2><p>Indicadores ilustrativos até a conexão dos serviços administrativos.</p></div><div className="control-orbit"><Orbit size={61}/><span/></div><div className="banner-health"><span>PLATAFORMA</span><strong><i/> Operacional</strong><small>Estado demonstrativo</small></div></section>
    <section className="dashboard-stats">
      <StatCard label="Sistemas cadastrados" value={applications.length} note="Catálogo do portal" icon={AppWindow}/>
      <StatCard label="Sistemas online" value={applications.filter(item => item.status === "Online").length} note="Estado do catálogo" icon={Server} tone="blue"/>
      <StatCard label="Eventos de segurança" value="—" note="Aguardando integração" icon={ShieldCheck} tone="amber"/>
      <StatCard label="Notificações não lidas" value={String(unread).padStart(2, "0")} note="Central de notificações" icon={Bell} tone="green"/>
    </section>
    <section className="control-section"><div className="control-section-head"><div><span className="eyebrow">ECOSSISTEMA</span><h2>Sistemas Satturnex</h2><p>O Hub conecta cada braço da operação em um único espaço.</p></div><Link to="/applications" className="text-link">Ver catálogo <ArrowRight size={15}/></Link></div><div className="system-grid">{[{name:"Satturnex Hub",description:"Núcleo de acesso e operação do ecossistema.",status:"Disponível",icon:Orbit,to:"/applications"},{name:"Satturnex Security",description:"Segurança, eventos e controle de acesso.",status:"Preparado para integração",icon:ShieldCheck,to:"/admin/security"},{name:"Satturnex Finance",description:"Gestão financeira conectada ao Hub.",status:"Em desenvolvimento",icon:Gauge,to:"/applications?category=Dados"},{name:"Satturnex Systems",description:"Sistemas e ferramentas operacionais.",status:"Catálogo disponível",icon:Server,to:"/applications?category=Suporte"},{name:"Satturnex Games",description:"Projetos e experiências interativas.",status:"Em desenvolvimento",icon:FolderKanban,to:"/applications/projects"},{name:"Satturnex Labs",description:"Pesquisa e experimentação.",status:"Experimental",icon:CircleDashed,to:"/favorites"}].map(({name,description,status,icon:Icon,to})=><Link className="system-card" to={to} key={name}><span className="system-icon"><Icon size={19}/></span><span className="system-title"><strong>{name}</strong><small>{description}</small></span><span className="system-status"><i/>{status}</span><span className="system-open">Abrir <ArrowRight size={14}/></span></Link>)}</div></section>
    <div className="dashboard-panels"><ActivityPanel/><ShortcutsPanel/></div>
  </>;
}
