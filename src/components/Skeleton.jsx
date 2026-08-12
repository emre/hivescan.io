/** Table-shaped placeholders, sized to roughly match real content so the
 *  layout doesn't jump when data arrives. Widths are varied per row so the
 *  block doesn't read as one flat grey rectangle. */
export function SkeletonRows({ cols, rows = 6 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="skel-row">
      {Array.from({ length: cols }).map((_, c) => (
        <td key={c}><span className="skel" style={{ width: `${38 + ((r * 7 + c * 13) % 48)}%` }} /></td>
      ))}
    </tr>
  ));
}

export function SkeletonFacts({ rows = 5 }) {
  return (
    <table className="kv">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            <th><span className="skel" style={{ width: "68%" }} /></th>
            <td><span className="skel" style={{ width: `${45 + (r * 11) % 40}%` }} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonTitle() {
  return (
    <div className="rec">
      <h1><span className="skel" style={{ width: 160, height: 18 }} /></h1>
    </div>
  );
}
