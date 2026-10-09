const checks = [/[a-z]/i, /\d/, /[^A-Za-z0-9]/];
// eslint-disable-next-line react-refresh/only-export-components
export function passwordStrength(value) {
  if (!value) return 0;
  return Number(value.length >= 8) + checks.reduce((score, pattern) => score + Number(pattern.test(value)), 0);
}
export default function PasswordStrength({ value }) {
  if (!value) return <p className="password-hint">Use ao menos 8 caracteres, incluindo letras e números.</p>;
  const score = passwordStrength(value);
  const labels = ["Muito curta", "Fraca", "Razoável", "Boa", "Forte"];
  return <div className={`password-strength strength-${score}`} aria-live="polite"><div>{[1, 2, 3, 4].map(step => <i key={step} className={step <= score ? "filled" : ""}/>)}</div><span>Força da senha: <strong>{labels[score]}</strong></span></div>;
}
