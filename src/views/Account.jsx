import { useChain } from "../hooks/useChain.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { Facts, Fact, Note, SectionHead, Gauge } from "../components/Facts.jsx";
import Avatar from "../components/Avatar.jsx";
import { SkeletonTitle, SkeletonFacts, SkeletonRows } from "../components/Skeleton.jsx";
import Mention from "../components/Mention.jsx";
import OpEntry from "../components/OpEntry.jsx";
import { normalizeOp } from "../lib/ops.js";
import { N, N3, asset, since, vestsToHP, manaPercent } from "../lib/format.js";
import { blockPath, externalUrl } from "../lib/url.js";
import { useTitle } from "../hooks/useTitle.js";

function ResourceCredits({ name }) {
  const { request } = useChain();
  const { data } = useAsync(() => request("rc_api.find_rc_accounts", { accounts: [name] }), [name]);
  const rc = data?.rc_accounts?.[0];
  if (!rc) return null;
  const pct = manaPercent(rc.rc_manabar, Number(rc.max_rc));
  return <Fact label="Resource credits"><Gauge pct={pct} />{pct.toFixed(1)}%</Fact>;
}

/** A witness sets this string itself. Only an http(s) URL becomes a link;
 *  anything else is shown as inert text so a javascript: or data: scheme
 *  can't run in our origin on click. */
function WitnessUrl({ url }) {
  if (!url) return "—";
  const href = externalUrl(url);
  if (!href) return <span className="dim">{String(url)}</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>;
}

/** Absent for most accounts — get_witness_by_account returns null rather
 *  than erroring, so this is a silent no-op for a non-witness. */
function WitnessSection({ name }) {
  const { request } = useChain();
  const { data: w } = useAsync(() => request("condenser_api.get_witness_by_account", [name]), [name]);
  if (!w) return null;

  const props = w.props ?? {};
  const quote = w.hbd_exchange_rate ? parseFloat(w.hbd_exchange_rate.quote) : 0;
  const feed = quote ? parseFloat(w.hbd_exchange_rate.base) / quote : null;

  return (
    <>
      <SectionHead>Witness</SectionHead>
      <Facts>
        <Fact label="Website"><WitnessUrl url={w.url} /></Fact>
        <Fact label="Signing key">{w.signing_key}</Fact>
        <Fact label="Last block produced">
          <a href={blockPath(w.last_confirmed_block_num)}>{N(w.last_confirmed_block_num)}</a>
        </Fact>
        <Fact label="Total missed">{N(w.total_missed)}</Fact>
        <Fact label="Running version">{w.running_version}</Fact>
        <Fact label="Price feed">{feed ? `$${feed.toFixed(3)}` : <span className="dim">stale</span>}</Fact>
        <Fact label="Account creation fee">{asset(props.account_creation_fee)}</Fact>
        <Fact label="Max block size">{props.maximum_block_size ? `${N(props.maximum_block_size)} B` : "—"}</Fact>
        <Fact label="HBD interest vote">
          {props.hbd_interest_rate != null ? `${(Number(props.hbd_interest_rate) / 100).toFixed(0)}%` : "—"}
        </Fact>
      </Facts>
    </>
  );
}

function History({ name }) {
  const { request } = useChain();
  const { loading, data, error } = useAsync(
    () => request("condenser_api.get_account_history", [name, -1, 30]), [name]
  );

  if (loading) {
    return (
      <table>
        <colgroup>
          <col style={{ width: 104 }} /><col style={{ width: 48 }} />
          <col style={{ width: 186 }} /><col /><col style={{ width: 60 }} />
        </colgroup>
        <tbody><SkeletonRows cols={5} rows={8} /></tbody>
      </table>
    );
  }
  if (error) {
    return (
      <Note heading="History is not served here">
        This endpoint runs without <code>account_history_api</code>. Switch endpoint to see it.
      </Note>
    );
  }
  const entries = [...(data ?? [])].reverse();
  if (!entries.length) return <Note>No recorded operations.</Note>;

  return (
    <table>
      <colgroup>
        <col style={{ width: 104 }} /><col style={{ width: 48 }} />
        <col style={{ width: 186 }} /><col /><col style={{ width: 60 }} />
      </colgroup>
      <thead>
        <tr><th>block</th><th className="fam">fam</th><th className="type">type</th><th></th><th className="r">age</th></tr>
      </thead>
      <tbody>
        {entries.map(([index, e]) => (
          <OpEntry
            key={index}
            op={normalizeOp(e.op)}
            blockNum={e.block}
            extra={since(e.timestamp)}
          />
        ))}
      </tbody>
    </table>
  );
}

export default function Account({ name }) {
  useTitle(`@${name}`);
  const { request, props } = useChain();
  const { loading, data } = useAsync(() => request("condenser_api.get_accounts", [[name]]), [name]);

  if (loading) return <><SkeletonTitle /><SkeletonFacts rows={6} /></>;
  const account = data?.[0];
  if (!account) {
    return (
      <Note heading={`No account named ${name}`}>
        Hive names are lowercase, three to sixteen characters, and may contain dots and dashes.
      </Note>
    );
  }

  const own = vestsToHP(props, parseFloat(account.vesting_shares));
  const out = vestsToHP(props, parseFloat(account.delegated_vesting_shares));
  const incoming = vestsToHP(props, parseFloat(account.received_vesting_shares));
  const effective = own != null ? own - (out ?? 0) + (incoming ?? 0) : null;

  // voting_manabar rides along with get_accounts — free, unlike RC below,
  // which needs its own rc_api round trip.
  const mb = account.voting_manabar;
  const effVests = parseFloat(account.vesting_shares)
    - parseFloat(account.delegated_vesting_shares)
    + parseFloat(account.received_vesting_shares);
  const votingPct = mb ? manaPercent(mb, effVests * 1e6) : null;

  return (
    <div style={{ marginTop: '1rem' }}>
      <div className="rec who">
        <Avatar name={account.name} />
        <div>
          <h1>{account.name}</h1>
          <div className="sub">joined {String(account.created).slice(0, 10)} · {N(account.post_count)} posts</div>
        </div>
      </div>
      <Facts>
        <Fact label="HIVE">{asset(account.balance)}</Fact>
        <Fact label="HBD">
          {asset(account.hbd_balance)}{" "}
          <span className="dim">· {asset(account.savings_hbd_balance)} in savings</span>
        </Fact>
        <Fact label="Hive Power owned">{own != null ? N3(own) : "—"}</Fact>
        <Fact label="Hive Power effective">
          {effective != null ? N3(effective) : "—"}{" "}
          <span className="dim">· {out != null ? N3(out) : "—"} out, {incoming != null ? N3(incoming) : "—"} in</span>
        </Fact>
        {votingPct != null && <Fact label="Voting power"><Gauge pct={votingPct} />{votingPct.toFixed(1)}%</Fact>}
        <ResourceCredits name={name} />
        <Fact label="Witness votes">
          {account.witness_votes?.length
            ? account.witness_votes.map((w, i) => (
                <span key={w}>{i > 0 && ", "}<Mention name={w} /></span>
              ))
            : account.proxy ? <>proxied to <Mention name={account.proxy} /></> : "none"}
        </Fact>
        <Fact label="Recovery account">{account.recovery_account}</Fact>
      </Facts>
      <WitnessSection name={name} />
      <SectionHead>History<span>most recent 30 operations</span></SectionHead>
      <History name={name} />
    </div>
  );
}
