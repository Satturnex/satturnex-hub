import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ChartNoAxesCombined, LifeBuoy, Layers3, Orbit } from "lucide-react";
import { applicationsService } from "../services/applicationsService";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

const icons = { orbit: Orbit, layers: Layers3, chart: ChartNoAxesCombined, "life-buoy": LifeBuoy };
export default function ApplicationDetails() {
  const { id } = useParams(); const navigate = useNavigate(); const [record, setRecord] = useState(null);
  useEffect(() => { applicationsService.getById(id).then(app => setRecord({ id, app })); }, [id]);
  const app = record?.id === id ? record.app : undefined;
  if (app === undefined) return <div className="route-loading" role="status">Carregando aplicação...</div>;
  if (!app) return <EmptyState icon={Orbit} title="Aplicação não encontrada" description="Confira o endereço ou volte para a lista de aplicações." action={<Button onClick={() => navigate("/applications")}>Ver aplicações</Button>}/>;
  const Icon = icons[app.icon] || Orbit;
  return <><button className="back-button" onClick={() => navigate("/applications")}><ArrowLeft size={15}/> Todas as aplicações</button><div className="application-detail-head"><span className="application-icon large"><Icon size={30}/></span><div><div className="detail-title-line"><h1>{app.name}</h1><Badge tone={app.status === "Online" ? "green" : "muted"}>{app.status}</Badge></div><p>{app.description}</p></div></div><div className="application-detail-grid"><Card className="detail-main-card"><span className="eyebrow">SOBRE A APLICAÇÃO</span><h2>Seu acesso centralizado</h2><p>{app.description} Esta aplicação faz parte do ecossistema Satturnex e pode ser acessada através do seu portal.</p>{app.href ? <a className="button button-primary" href={app.href} target={app.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">Abrir aplicação <ArrowUpRight size={16}/></a> : <Button disabled>Disponível em breve</Button>}</Card><Card className="detail-info-card"><h2>Informações</h2><dl><div><dt>Status</dt><dd><Badge tone={app.status === "Online" ? "green" : "muted"}>{app.status}</Badge></dd></div><div><dt>Categoria</dt><dd>{app.category}</dd></div><div><dt>Última atualização</dt><dd>{app.updated}</dd></div><div><dt>Versão</dt><dd>{app.version}</dd></div></dl></Card></div></>;
}
