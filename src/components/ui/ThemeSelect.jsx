import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeSelect({ compact = false }) {
  const { preference, setPreference } = useTheme();
  return <label className={`theme-select ${compact ? "theme-select-compact" : ""}`} title="Aparência"><span className="theme-select-icon">{preference === "dark" ? <Moon size={16}/> : preference === "system" ? <Laptop size={16}/> : <Sun size={16}/>}</span><select aria-label="Selecionar tema" value={preference} onChange={event => setPreference(event.target.value)}><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option></select></label>;
}
