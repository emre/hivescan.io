export function Facts({ children }) {
  return <table className="kv"><tbody>{children}</tbody></table>;
}
export function Fact({ label, children }) {
  return <tr><th>{label}</th><td>{children}</td></tr>;
}
export function Note({ heading, children }) {
  return (
    <p className="msg">
      {heading && <strong>{heading}</strong>}
      {children}
    </p>
  );
}
export function SectionHead({ children, right }) {
  return <h2>{children}{right}</h2>;
}
export function Gauge({ pct }) {
  return <span className="bar"><i style={{ width: `${pct.toFixed(1)}%` }} /></span>;
}
