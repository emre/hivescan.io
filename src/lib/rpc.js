export const ENDPOINTS = [
  "https://api.hive.blog",
  "https://api.deathwing.me",
  "https://api.openhive.network",
  "https://techcoderx.com",
  "https://hive-api.arcange.eu",
  "https://anyx.io",
];

const TIMEOUT = 8000;

async function once(endpoint, method, params, signal) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  const relay = () => ctl.abort();
  signal?.addEventListener("abort", relay, { once: true });
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || "rpc error");
    return json.result;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", relay);
  }
}

export async function call(preferred, method, params = [], opts = {}) {
  const { failover = true, signal } = opts;
  const list = failover
    ? [preferred, ...ENDPOINTS.filter((e) => e !== preferred)]
    : [preferred];

  let last;
  for (const endpoint of list) {
    const t0 = performance.now();
    try {
      const result = await once(endpoint, method, params, signal);
      return { result, endpoint, ms: Math.round(performance.now() - t0) };
    } catch (err) {
      if (signal?.aborted) throw err;
      last = err;
    }
  }
  throw last ?? new Error("no endpoint responded");
}
