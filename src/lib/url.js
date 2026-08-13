/**
 * Chain data is attacker-controlled: a witness sets its own `url`, and op
 * payload fields carry whatever the signer put there. Anything that reaches
 * an href or a path segment goes through here first.
 */

/** An absolute http(s) URL, or null. Rejects javascript:, data:, vbscript:,
 *  and scheme-less strings — a relative href would resolve against our own
 *  origin and read as if we vouched for it. Callers render null as text. */
export function externalUrl(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
}

/** A path segment that can't break out of the route it's embedded in — an
 *  unencoded value could smuggle in ?, #, or a further / and point the link
 *  somewhere other than the record it labels. */
export const segment = (value) => encodeURIComponent(String(value ?? ""));

export const accountPath = (name) => `/@${segment(name)}`;
export const blockPath = (num) => `/block/${segment(num)}`;
export const txPath = (id) => `/tx/${segment(id)}`;
