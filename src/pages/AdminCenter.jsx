import { ArrowRight, Building2, CircleDashed, KeyRound, PlugZap, ScrollText, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import { adminOverview } from "../data/adminOverview";

const sections = {
  users: { title: "Usuários", eyebrow: "GESTÃO DE ACESSO", description: "A gestão de usuários estará disponível quando o serviço administrativo estiver conectado.", icon: Users, items: ["Diretório de usuários", "Equipe", "Convites e status de acesso"] },
  team: { title: "Equipe", eyebrow: "GESTÃO DE ACESSO", description: "Organize as equipes e responsabilidades da operação Satturnex.", icon: Users, items: ["Membros da equipe", "Convites", "Responsabilidades"] },
  permissions: { title: "Perfis e permissões", eyebrow: "RBAC · PREPARADO", description: "Estrutura visual preparada para integração com controle de acesso baseado em função.", icon: KeyRound, items: ["SUPER ADMIN", "ADMIN", "MANAGER", "OPERATOR", "USER"], permissions: ["Dashboard", "Usuários", "Clientes", "Segurança", "Sistemas", "Logs", "Configurações", "API"] },
  organizations: { title: "Organizações", eyebrow: "GESTÃO DE CONTAS", description: "Gerencie organizações e seus sistemas conectados ao Hub.", icon: Building2, items: ["Organizações", "Responsáveis", "Sistemas contratados"] },
  clients: { title: "Clientes", eyebrow: "GESTÃO DE CONTAS", description: "A área de clientes está preparada para receber dados do backend.", icon: Building2, items: ["Diretório de clientes", "Status de conta", "Atividade recente"] },
  security: { title: "Central de segurança", eyebrow: "SECURITY OVERVIEW", description: "Visão preparada para telemetria de segurança. Não há eventos reais conectados.", icon: ShieldCheck, items: ["Security score", "Eventos nas últimas 24h", "Tentativas de acesso", "Sessões ativas", "Dispositivos conectados", "Alertas críticos"] },
  audit: { title: "Logs e auditoria", eyebrow: "TRILHA DE AUDITORIA", description: "A trilha de auditoria será alimentada por eventos assinados pelo backend.", icon: ScrollText, items: ["Timestamp", "Usuário", "Ação", "Recurso", "IP", "Status"] },
  integrations: { title: "Integrações e API", eyebrow: "PLATAFORMA", description: "Conectores, credenciais e chaves serão configurados quando a API administrativa estiver disponível.", icon: PlugZap, items: ["Integrações", "API Keys", "Webhooks", "Estado de conexão"] },
  health: { title: "Saúde da plataforma", eyebrow: "PLATFORM HEALTH", description: "Disponibilidade e telemetria serão exibidas quando os serviços estiverem conectados.", icon: ShieldCheck, items: [] },
};

export default function AdminCenter() {
  const { pathname } = useLocation();
  const key = pathname.split("/").pop();
  const section = sections[key] || sections.security;
  const Icon = section.icon;
  return <>
    <PageHeader eyebrow={section.eyebrow} title={section.title} description={section.description} action={<span className="demo-badge"><CircleDashed size={14}/> Preparado para integração</span>} />
    {key === "security" && <section className="security-summary"><Card className="security-score"><span className="eyebrow">SECURITY SCORE</span><div className="score-ring"><div><strong>—</strong><small>SEM TELEMETRIA</small></div></div><p>O score será calculado com dados reais de segurança.</p></Card><div className="security-metrics">{section.items.slice(1).map((item) => <Card className="security-metric" key={item}><span>{item}</span><strong>—</strong><small>Aguardando integração</small></Card>)}</div></section>}
    {key === "health" ? <section className="health-grid">{adminOverview.systems.map(system => <Card className="health-card" key={system.name}><span><i className="health-dot"/>{system.name}</span><strong>{system.state}</strong><small>Estado da conexão</small></Card>)}</section> : key === "permissions" ? <Card className="admin-panel"><div className="admin-panel-heading"><Icon/><div><h2>Matriz de permissões</h2><p>Modelo de referência. Alterações exigirão autorização no backend.</p></div></div><div className="permission-table-wrap"><table className="permission-table"><thead><tr><th>Perfil</th>{section.permissions.map(item=><th key={item}>{item}</th>)}</tr></thead><tbody>{section.items.map((role,index)=><tr key={role}><th>{role}</th>{section.permissions.map((item,column)=><td key={item}><span aria-label={`${role}: ${index===0||column < Math.max(1,8-index*2) ? "incluído no modelo de referência" : "sem permissão no modelo de referência"}`}>{index===0||column < Math.max(1,8-index*2) ? "✓" : "—"}</span></td>)}</tr>)}</tbody></table></div><p className="demo-note">Matriz ilustrativa, sem autorização efetiva aplicada no cliente.</p></Card> : key !== "security" ? <Card className="admin-panel"><div className="admin-panel-heading"><Icon/><div><h2>{key === "health" ? "Platform Health" : section.title}</h2><p>{key === "audit" ? "Eventos SUCCESS · WARNING · ERROR · CRITICAL" : "Estrutura demonstrativa. Nenhum dado operacional real está sendo exibido."}</p></div></div><div className="admin-feature-grid">{section.items.map(item=><div className="admin-feature" key={item}><span>{item}</span><small>{key === "audit" ? "Sem eventos conectados" : "Preparado para integração"}</small></div>)}</div><div className="admin-empty"><CircleDashed size={21}/><strong>Esta funcionalidade está sendo preparada.</strong><span>Os componentes estão prontos para receber serviços administrativos autenticados.</span></div></Card> : null}
    <Card className="admin-next-step"><span><strong>Centro de controle Satturnex</strong><small>Volte ao painel para acompanhar o catálogo do ecossistema.</small></span><Link to="/dashboard">Ir ao dashboard <ArrowRight size={15}/></Link></Card>
  </>;
}
