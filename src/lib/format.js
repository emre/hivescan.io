export const N = (x) => Number(x).toLocaleString("en-US");

export const N3 = (x) =>
  Number(x).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

export function since(iso) {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso + "Z")) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const NAI = { "@@000000021": "HIVE", "@@000000013": "HBD" };

export function asset(a) {
  if (a == null) return "";
  if (typeof a === "string") return a;
  if (a.amount != null) {
    const v = Number(a.amount) / 10 ** a.precision;
    const sym = NAI[a.nai] ?? "VESTS";
    const n = v.toLocaleString("en-US", {
      minimumFractionDigits: a.precision,
      maximumFractionDigits: a.precision,
    });
    return `${n} ${sym}`;
  }
  return String(a);
}

export function vestsToHP(props, vests) {
  if (!props) return null;
  const fund = parseFloat(props.total_vesting_fund_hive);
  const shares = parseFloat(props.total_vesting_shares);
  if (!shares) return null;
  return (parseFloat(vests) * fund) / shares;
}

const REGEN_SECONDS = 432000;

/** A manabar's current fill, regenerated forward from its last update.
 *  Shared by resource credits and voting power — same shape, different max. */
export function manaPercent(manabar, max) {
  if (!manabar || !(max > 0)) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - manabar.last_update_time;
  const current = Math.min(max, Number(manabar.current_mana) + (max * elapsed) / REGEN_SECONDS);
  return Math.max(0, Math.min(100, (current / max) * 100));
}
