import { useEffect, useMemo, useState } from "react";
import { useTitle } from "../hooks/useTitle.js";
import { useChain } from "../hooks/useChain.jsx";
import StatusLine from "../components/StatusLine.jsx";
import OpFilters from "../components/OpFilters.jsx";
import OpEntry from "../components/OpEntry.jsx";
import { SkeletonRows } from "../components/Skeleton.jsx";
import { SectionHead, Note } from "../components/Facts.jsx";
import { N } from "../lib/format.js";

const LIMIT = 80;

export default function Ops() {
  useTitle("Operations");
  const { blocks } = useChain();
  const [selected, setSelected] = useState(() => new Set());
  const [opened, setOpened] = useState(() => new Set());

  const live = useMemo(
    () => blocks.flatMap((b) => b.ops.map((op) => ({ ...op, num: b.num }))),
    [blocks]
  );

  // Reading a payload beats watching the stream move: while anything is
  // open, the visible list is frozen. This effect is gated on opened.size,
  // not on `live` itself, so it only refreshes the snapshot once nothing
  // is expanded — and does so the instant the last one closes.
  const [frozen, setFrozen] = useState(live);
  useEffect(() => {
    if (!opened.size) setFrozen(live);
  }, [live, opened.size]);

  const shown = useMemo(
    () => (selected.size ? frozen.filter((op) => selected.has(op.name)) : frozen).slice(0, LIMIT),
    [frozen, selected]
  );

  const toggleFilter = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setOpened(new Set());
    setFrozen(live);
  };
  const clearFilter = () => {
    setSelected(new Set());
    setOpened(new Set());
    setFrozen(live);
  };
  const toggleOpen = (key) =>
    setOpened((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div style={{ marginTop: '1rem' }}>
      <SectionHead>
        Operations
        <span><StatusLine /></span>
      </SectionHead>
      <div style={{ marginBottom: '1rem' }}>
        <span className="dim" style={{ fontSize: '12px' }}>
          {opened.size
            ? `Held while a payload is open · ${N(live.length)} in the last ${blocks.length} blocks`
            : `${N(live.length)} across the last ${blocks.length} blocks`}
        </span>
      </div>
      <OpFilters ops={live} selected={selected} onToggle={toggleFilter} onClear={clearFilter} />
      {shown.length || !blocks.length ? (
        <table style={{ marginTop: 10 }}>
          <colgroup>
            <col style={{ width: 104 }} /><col style={{ width: 48 }} />
            <col style={{ width: 186 }} /><col style={{ width: 120 }} /><col />
          </colgroup>
          <thead>
            <tr><th>block</th><th className="fam">fam</th><th className="type">type</th><th>transaction</th><th></th></tr>
          </thead>
          <tbody>
            {!blocks.length && <SkeletonRows cols={5} rows={10} />}
            {shown.map((op) => (
              <OpEntry
                key={op.key}
                op={op}
                blockNum={op.num}
                txId={op.trx}
                open={opened.has(op.key)}
                onToggle={() => toggleOpen(op.key)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <Note>Nothing matching that filter in the current window.</Note>
      )}
    </div>
  );
}
