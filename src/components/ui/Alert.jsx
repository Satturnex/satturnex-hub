import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
const icons = { info: Info, success: CircleCheck, warning: TriangleAlert, error: CircleAlert };
export default function Alert({ type = "info", title, children }) {
  const Icon = icons[type] || Info;
  return <div className={`alert alert-${type}`} role={type === "error" ? "alert" : "status"}><Icon size={17}/><span>{title && <strong>{title}</strong>}{children}</span></div>;
}
