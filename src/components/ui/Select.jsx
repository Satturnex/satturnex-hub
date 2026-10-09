export default function Select({ label, id, options, ...props }) {
  return <label className="field" htmlFor={id}><span>{label}</span><select id={id} {...props}>{options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>;
}
