import { useChain } from "../hooks/useChain.jsx";
import { useTitle } from "../hooks/useTitle.js";
import { useAsync } from "../hooks/useAsync.js";
import RoundComb from "../components/RoundComb.jsx";
import Avatar from "../components/Avatar.jsx";
import { Note, SectionHead } from "../components/Facts.jsx";
import { SkeletonRows } from "../components/Skeleton.jsx";
import { N, vestsToHP } from "../lib/format.js";

const CONSENSUS = 20;

function Row({ witness, rank, props }) {
  const votes = vestsToHP(props, parseFloat(witness.votes) / 1e6);
  const quote = witness.hbd_exchange_rate ? parseFloat(witness.hbd_exchange_rate.quote) : 0;
  const price = quote ? parseFloat(witness.hbd_exchange_rate.base) / quote : null;

  return (
    <tr style={rank === CONSENSUS ? { borderBottom: "1px solid var(--rule-2)" } : undefined}>
      <td className="m rank">{rank}</td>
      <td>
        <a href={`/@${witness.owner}`}>
          <Avatar name={witness.owner} small />
          {witness.owner}
        </a>
        {rank > CONSENSUS && <span className="fam"> backup</span>}
      </td>
      <td className="m r">{votes != null ? `${N(Math.round(votes / 1000))}k` : "—"}</td>
      <td className="m r dim">{N(witness.total_missed)}</td>
      <td className="m r">{price ? `$${price.toFixed(3)}` : <span className="dim">stale</span>}</td>
      <td className="m dim r">{witness.running_version}</td>
      <td className="m dim r">
        {witness.props ? `${(Number(witness.props.hbd_interest_rate) / 100).toFixed(0)}%` : "—"}
      </td>
    </tr>
  );
}

export default function Witnesses() {
  useTitle("Witnesses");
  const { request, props } = useChain();
  const { loading, data, error } = useAsync(
    () => request("condenser_api.get_witnesses_by_vote", ["", 40]), []
  );

  return (
    <div style={{ marginTop: '1rem' }}>
      <RoundComb />
      {error && <Note heading="The witness set could not be loaded">Every endpoint should serve this call. Try switching.</Note>}
      {(loading || data) && (
        <>
          <SectionHead>Witnesses<span>top twenty produce every round; the rest share one backup slot</span></SectionHead>
          <table>
            <colgroup>
              <col style={{ width: 46 }} /><col /><col style={{ width: 104 }} /><col style={{ width: 82 }} />
              <col style={{ width: 76 }} /><col style={{ width: 76 }} /><col style={{ width: 72 }} />
            </colgroup>
            <thead>
              <tr><th className="rank">#</th><th>account</th><th className="r">votes</th>
                <th className="r">missed</th><th className="r">feed</th><th className="r">version</th><th className="r">hbd apr</th></tr>
            </thead>
            <tbody>
              {loading
                ? <SkeletonRows cols={7} rows={12} />
                : data.map((w, i) => <Row key={w.owner} witness={w} rank={i + 1} props={props} />)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
