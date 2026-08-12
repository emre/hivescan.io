import { useChain } from "../hooks/useChain.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { Facts, Fact, Note, SectionHead } from "../components/Facts.jsx";
import CopyableHash from "../components/CopyableHash.jsx";
import { SkeletonTitle, SkeletonFacts } from "../components/Skeleton.jsx";
import OpEntry from "../components/OpEntry.jsx";
import Mention from "../components/Mention.jsx";
import { N, since } from "../lib/format.js";
import { useTitle } from "../hooks/useTitle.js";

export default function Block({ num }) {
  const { fetchBlock, props } = useChain();
  const n = Number(num);
  useTitle(`Block ${N(n)}`);
  const { loading, data: block } = useAsync(() => fetchBlock(n), [n]);

  if (loading) return <><SkeletonTitle /><SkeletonFacts rows={4} /></>;
  if (!block) {
    return (
      <Note heading={`Block ${num} not returned`}>
        It is either past the head, or this endpoint has pruned it. Try another endpoint.
      </Note>
    );
  }

  const lib = props?.last_irreversible_block_num ?? 0;
  const settled = n <= lib;

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="rec">
        <h1>Block {N(n)}</h1>
        <CopyableHash value={block.id} />
      </div>
      <Facts>
        <Fact label="Produced by"><Mention name={block.by} /></Fact>
        <Fact label="Timestamp">{block.at}Z · {since(block.at)} ago</Fact>
        <Fact label="Finality">
          {settled ? "Irreversible — settled by 20 witnesses" : `Reversible for another ${(n - lib) * 3}s`}
        </Fact>
        <Fact label="Contents">{block.txs} transactions, {block.ops.length} operations</Fact>
      </Facts>
      <SectionHead right={
        <span className="pager">
          <a href={`#/block/${n - 1}`}>← {N(n - 1)}</a> · <a href={`#/block/${n + 1}`}>{N(n + 1)} →</a>
        </span>
      }>
        Operations
      </SectionHead>
      {block.ops.length ? (
        <table>
          <colgroup>
            <col style={{ width: 48 }} /><col style={{ width: 186 }} />
            <col /><col style={{ width: 128 }} />
          </colgroup>
          <thead>
            <tr><th className="fam">fam</th><th className="type">type</th><th></th><th className="r">transaction</th></tr>
          </thead>
          <tbody>
            {block.ops.map((op) => (
              <OpEntry
                key={op.key}
                op={op}
                extra={op.trx ? <a href={`#/tx/${op.trx}`}>{op.trx.slice(0, 12)}…</a> : "virtual"}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <Note heading="Empty block">
          The witness produced on schedule with no transactions to include.
        </Note>
      )}
    </div>
  );
}
