import { useChain } from "../hooks/useChain.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { Facts, Fact, Note, SectionHead } from "../components/Facts.jsx";
import CopyableHash from "../components/CopyableHash.jsx";
import { SkeletonTitle, SkeletonFacts } from "../components/Skeleton.jsx";
import { N } from "../lib/format.js";
import { useTitle } from "../hooks/useTitle.js";
import { useCopy } from "../hooks/useCopy.js";

export default function Tx({ id }) {
  useTitle(`Transaction ${id.slice(0, 10)}…`);
  const { request } = useChain();
  const { loading, data: tx, error } = useAsync(
    () => request("condenser_api.get_transaction", [id]), [id]
  );
  const [copied, copy] = useCopy();

  if (loading) return <><SkeletonTitle /><SkeletonFacts rows={4} /></>;
  if (error || !tx) {
    return (
      <Note heading="This endpoint does not index transactions">
        Lookup by id needs <code>account_history_api</code> with{" "}
        <code>transaction_indexing</code>, which not every public node enables.{" "}
        <code>api.hive.blog</code> does — switch endpoint and retry.
      </Note>
    );
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="rec">
        <h1>Transaction</h1>
        <CopyableHash value={id} />
      </div>
      <Facts>
        <Fact label="Block"><a href={`/block/${tx.block_num}`}>{N(tx.block_num)}</a></Fact>
        <Fact label="Index in block">{tx.transaction_num}</Fact>
        <Fact label="Expiration">{tx.expiration}</Fact>
        <Fact label="Signatures">{(tx.signatures ?? []).length}</Fact>
      </Facts>
      <SectionHead>
        Raw Transaction
        <span>
          <button 
            onClick={() => copy(JSON.stringify(tx, null, 2))}
            style={{ 
              background: 'var(--band)', 
              border: '1px solid var(--rule)', 
              borderRadius: '2px', 
              padding: '2px 8px', 
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'var(--sans)',
              color: 'var(--ink-2)'
            }}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </span>
      </SectionHead>
      <pre style={{
        background: 'var(--band)',
        padding: '12px',
        borderRadius: '2px',
        fontSize: '11.5px',
        overflow: 'auto',
        maxHeight: '400px'
      }}>
        {JSON.stringify(tx, null, 2)}
      </pre>
    </div>
  );
}
