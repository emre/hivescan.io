import { useMemo } from "react";
import { useChain } from "../hooks/useChain.jsx";
import StatusLine from "./StatusLine.jsx";
import { SectionHead } from "./Facts.jsx";
import { accountPath } from "../lib/url.js";

/**
 * The 21 witness slots of the current round. A slot's position is derived
 * from its block's timestamp relative to the head block — missed slots
 * produce no block at all, so block numbers alone can't reveal a gap.
 * Each tick links to its witness; the strip doubles as navigation.
 */
export default function RoundComb() {
  const { props, round, blocks } = useChain();

  const { pos, made } = useMemo(() => {
    if (!props || !round.length || !blocks.length) return { pos: -1, made: new Set() };
    const head = blocks[0];
    let p = round.indexOf(head.by);
    if (p < 0) p = round.indexOf(props.current_witness);
    if (p < 0) return { pos: -1, made: new Set() };

    const headAt = Date.parse(head.at + "Z");
    const madeSet = new Set();
    for (const b of blocks) {
      const slot = p - Math.round((headAt - Date.parse(b.at + "Z")) / 3000);
      if (slot < 0) break;
      madeSet.add(slot);
    }
    return { pos: p, made: madeSet };
  }, [props, round, blocks]);

  if (pos < 0) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <SectionHead>Witness Schedule<span><StatusLine /></span></SectionHead>
        <div className="round">
          <div className="ticks">
            {Array.from({ length: 21 }).map((_, n) => (
              <div key={n} className="tick" style={{ opacity: 0.3 }} />
            ))}
          </div>
          <p className="cap">Loading witness schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <SectionHead>Witness Schedule<span><StatusLine /></span></SectionHead>
      <div className="round">
        <div className="ticks">
          {round.map((w, n) => (
            <a
              key={w}
              className={`tick ${n === pos ? "now" : made.has(n) ? "was" : ""}`}
              href={accountPath(w)}
              data-n={w}
            />
          ))}
        </div>
        <p className="cap">Round slot {pos + 1} of 21 — {blocks[0].by} produced the head block.</p>
      </div>
    </div>
  );
}
