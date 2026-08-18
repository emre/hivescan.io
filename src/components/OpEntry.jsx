import { useMemo, useState } from "react";
import { familyOf, expandEmbedded } from "../lib/ops.js";
import { N } from "../lib/format.js";
import { blockPath, txPath } from "../lib/url.js";
import OpSummary from "./OpSummary.jsx";

/**
 * A table row that expands into a JSON row beneath it. Columns are
 * [block?] fam type [tx?] summary [extra?] — block and extra are optional so the
 * same component serves the stream (has block, no extra), a block's own
 * op list (no block, has a transaction-link extra), a transaction's op
 * list (neither), and account history (both). Column count, and so the
 * JSON row's colSpan, is derived rather than passed in by each caller.
 *
 * Uncontrolled by default (Block/Tx/Account — static, one-shot data).
 * Pass open+onToggle to run it controlled — see views/Ops.jsx, which needs
 * to know from outside whether anything is expanded, to freeze the live
 * stream while a payload is being read.
 */
export default function OpEntry({ op, blockNum, txId, extra, open: controlledOpen, onToggle }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const isOpen = controlled ? controlledOpen : internalOpen;
  const toggle = () => (controlled ? onToggle() : setInternalOpen((o) => !o));

  const cols = (blockNum != null ? 1 : 0) + 3 + (txId != null ? 1 : 0) + (extra !== undefined ? 1 : 0);

  // Only pay for this once a row is actually expanded — the stream renders
  // hundreds of collapsed rows a minute.
  const json = useMemo(
    () => (isOpen ? JSON.stringify(expandEmbedded(op.data), null, 2) : null),
    [isOpen, op.data]
  );

  return (
    <>
      <tr className={isOpen ? "open" : undefined} onClick={toggle}>
        {blockNum != null && (
          <td className="m">
            <a href={blockPath(blockNum)} onClick={(e) => e.stopPropagation()}>{N(blockNum)}</a>
          </td>
        )}
        <td className="fam">{familyOf(op.name)}</td>
        <td className="type">{op.name}</td>
        {txId != null && (
          <td className="m">
            <a href={txPath(txId)} onClick={(e) => e.stopPropagation()}>{String(txId).slice(0, 8)}…</a>
          </td>
        )}
        <td className="gist"><OpSummary name={op.name} data={op.data} /></td>
        {extra !== undefined && <td className="m r dim">{extra}</td>}
      </tr>
      {isOpen && (
        <tr className="jsonrow">
          <td className="json" colSpan={cols}>
            <pre>{json}</pre>
          </td>
        </tr>
      )}
    </>
  );
}
