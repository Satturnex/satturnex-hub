export default function Avatar({ name = "Gustavo", size = "md", src }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <span className={`avatar avatar-${size}`} aria-label={`Avatar de ${name}`}>{src ? <img src={src} alt=""/> : initials || "U"}</span>;
}
