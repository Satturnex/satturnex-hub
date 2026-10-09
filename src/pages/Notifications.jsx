import { useEffect, useState } from "react";
import { Bell, Check, CircleAlert, Info, Mail, Trash2 } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import { notificationsService } from "../services/notificationsService";

const typeIcons = { info: Info, success: Check, warning: CircleAlert, error: CircleAlert };

function NotificationItem({ item, onMarkRead, onMarkUnread, onRemove }) {
  const Icon = typeIcons[item.type] || Info;
  return <article className={`notification-card ${item.read ? "is-read" : ""}`}>
    <span className={`notification-type type-${item.type}`}><Icon size={17}/></span>
    <div className="notification-copy">
      <div><h2>{item.title}</h2>{!item.read && <span className="unread-pill">Nova</span>}</div>
      <p>{item.message}</p>
      <small>{item.time}</small>
    </div>
    <div className="notification-actions">
      {item.read
        ? <button aria-label="Marcar como não lida" title="Marcar como não lida" onClick={() => onMarkUnread(item.id)}><Mail size={16}/></button>
        : <button aria-label="Marcar como lida" title="Marcar como lida" onClick={() => onMarkRead(item.id)}><Check size={16}/></button>}
      <button aria-label="Excluir notificação" title="Excluir" onClick={() => onRemove(item.id)}><Trash2 size={16}/></button>
    </div>
  </article>;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  useEffect(() => { notificationsService.list().then(setItems); }, []);
  const unread = items.filter(item => !item.read).length;
  const markRead = async id => setItems(await notificationsService.markRead(id));
  const markUnread = async id => setItems(await notificationsService.markUnread(id));
  const markAllRead = async () => setItems(await notificationsService.markAllRead());
  const remove = async id => setItems(await notificationsService.remove(id));

  return <>
    <PageHeader eyebrow="CENTRAL DE AVISOS" title="Notificações" description={`${unread} não lidas · ${items.length} no total`} action={unread > 0 && <button className="button button-outline" onClick={markAllRead}>Marcar todas como lidas</button>}/>
    {items.length > 0
      ? <div className="notifications-list">{items.map(item => <NotificationItem key={item.id} item={item} onMarkRead={markRead} onMarkUnread={markUnread} onRemove={remove}/>)}</div>
      : <EmptyState icon={Bell} title="Tudo em dia" description="Não há notificações para mostrar."/>}
  </>;
}
