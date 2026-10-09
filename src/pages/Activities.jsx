import { Activity, AppWindow, FolderPlus, Orbit } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { activities } from "../data/activities";

const activityIcons = { update: Orbit, project: FolderPlus, application: AppWindow, welcome: Activity };

function TimelineItem({ item }) {
  const Icon = activityIcons[item.type] || Activity;
  return <article className="timeline-item"><span className="timeline-icon"><Icon size={16}/></span><div><h3>{item.title}</h3><p>{item.detail}</p><small>{item.time}</small></div></article>;
}

export default function Activities() {
  const groups = [...new Set(activities.map(item => item.group))];
  return <>
    <PageHeader eyebrow="SEU ESPAÇO DE TRABALHO" title="Atividades" description="Acompanhe as atualizações recentes do seu portal."/>
    <div className="timeline">{groups.map(group => <section className="timeline-group" key={group}><h2>{group}</h2>{activities.filter(item => item.group === group).map(item => <TimelineItem key={item.id} item={item}/>)}</section>)}</div>
  </>;
}
