import { initialNotifications } from "../data/notifications";
const KEY = "satturnex-notifications";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? initialNotifications; } catch { return initialNotifications; } };
const save = items => { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event("satturnex:notifications")); return items; };
export const notificationsService = {
  async list() { return read(); },
  async markRead(id) { return save(read().map(item => item.id === id ? { ...item, read: true } : item)); },
  async markUnread(id) { return save(read().map(item => item.id === id ? { ...item, read: false } : item)); },
  async markAllRead() { return save(read().map(item => ({ ...item, read: true }))); },
  async remove(id) { return save(read().filter(item => item.id !== id)); },
};
