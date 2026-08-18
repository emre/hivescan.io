import { asset as assetOf } from "./format.js";

const FAMILIES = {
  val: [
    "transfer", "transfer_to_vesting", "withdraw_vesting", "transfer_to_savings",
    "transfer_from_savings", "limit_order_create", "limit_order_cancel", "fill_order",
    "recurrent_transfer", "fill_recurrent_transfer", "convert", "collateralized_convert",
    "fill_convert_request", "escrow_transfer", "escrow_release",
  ],
  soc: [
    "vote", "comment", "comment_options", "delete_comment",
    "effective_comment_vote", "comment_payout_update",
  ],
  rwd: [
    "claim_reward_balance", "author_reward", "curation_reward", "producer_reward",
    "comment_benefactor_reward", "interest", "fill_vesting_withdraw",
    "delegate_vesting_shares", "return_vesting_delegation",
  ],
  gov: [
    "account_witness_vote", "account_witness_proxy", "witness_update",
    "witness_set_properties", "feed_publish", "update_proposal_votes",
    "create_proposal", "update_proposal", "remove_proposal", "account_update",
    "account_update2", "account_create", "create_claimed_account", "claim_account",
    "change_recovery_account", "request_account_recovery", "recover_account",
  ],
};

const FAMILY_OF = {};
for (const [family, names] of Object.entries(FAMILIES)) {
  for (const name of names) FAMILY_OF[name] = family;
}

/** Three-letter text tag — val / soc / rwd / gov / json. No colour coding. */
export const familyOf = (op) => FAMILY_OF[op] ?? "json";

/** block_api returns {type,value}; condenser_api returns [name,payload]. */
export function normalizeOp(op) {
  return Array.isArray(op)
    ? { name: op[0], data: op[1] }
    : { name: String(op.type).replace(/_operation$/, ""), data: op.value };
}

export const normalizeOps = (tx) => (tx.operations ?? []).map(normalizeOp);

/**
 * custom_json — and follow, reblog, and the layer-two apps built on it —
 * carries a whole JSON document inside a JSON *string*. Stringifying the
 * payload as-is renders that field as one long \"-escaped line, so parse
 * embedded documents through and let them nest as structure instead.
 *
 * Depth-limited: a hostile payload could otherwise nest strings-in-strings
 * deep enough to make this recurse pathologically. A string that isn't JSON
 * is left exactly as it was.
 */
export function expandEmbedded(value, depth = 0) {
  if (depth > 6) return value;
  if (typeof value === "string") {
    const s = value.trim();
    if (s.length < 2 || (s[0] !== "{" && s[0] !== "[")) return value;
    try {
      const parsed = JSON.parse(s);
      return parsed && typeof parsed === "object" ? expandEmbedded(parsed, depth + 1) : value;
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map((v) => expandEmbedded(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, expandEmbedded(v, depth + 1)])
    );
  }
  return value;
}

/**
 * One-line summary as a token list, not a string: {mention: name} for an
 * account field, {text: "..."} for everything else. Consumers render mention
 * tokens as links and text tokens as escaped text — see <OpSummary>.
 */
export function summaryTokens(name, d) {
  const t = (text) => ({ text });
  const m = (account) => ({ mention: account });
  const join = (...parts) => parts.filter(Boolean);

  if (!d) return [];
  switch (name) {
    case "transfer":
    case "recurrent_transfer":
      return join(m(d.from), t(" → "), m(d.to), t(` · ${assetOf(d.amount)}`));
    case "vote":
      return join(m(d.voter), t(" → "), m(d.author), t(` · ${(d.weight / 100).toFixed(0)}%`));
    case "comment":
      return d.parent_author
        ? join(m(d.author), t(" replying to "), m(d.parent_author))
        : join(m(d.author), t(` · ${String(d.title || d.permlink).slice(0, 48)}`));
    case "custom_json": {
      const auths = d.required_posting_auths ?? d.required_auths ?? [];
      const mentions = auths.flatMap((a, i) => (i ? [t(", "), m(a)] : [m(a)]));
      return join(t(`${d.id} · `), ...mentions);
    }
    case "claim_reward_balance":
      return join(m(d.account), t(` · ${assetOf(d.reward_hive)}, ${assetOf(d.reward_hbd)}`));
    case "transfer_to_vesting":
      return join(m(d.from), t(" → "), m(d.to || d.from), t(` · ${assetOf(d.amount)}`));
    case "delegate_vesting_shares":
      return join(m(d.delegator), t(" → "), m(d.delegatee));
    case "account_witness_vote":
      return join(m(d.account), t(d.approve ? " voted for " : " unvoted "), m(d.witness));
    case "feed_publish":
      return join(m(d.publisher), t(` · ${assetOf(d.exchange_rate?.base)}`));
    case "producer_reward":
      return d.producer ? [m(d.producer)] : [];
    case "limit_order_create":
      return join(m(d.owner), t(` · ${assetOf(d.amount_to_sell)} for ${assetOf(d.min_to_receive)}`));
    case "fill_order":
      return join(m(d.current_owner), t(" / "), m(d.open_owner));
    default:
      for (const k of ["account", "author", "from", "owner", "voter", "publisher", "creator", "delegator"]) {
        if (d[k]) return [m(d[k])];
      }
      return [];
  }
}

