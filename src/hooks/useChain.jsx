import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { call, ENDPOINTS } from "../lib/rpc.js";
import { normalizeOps } from "../lib/ops.js";

const ChainContext = createContext(null);

const POLL_MS = 1500;
const WINDOW = 30;
const CATCHUP = 14;

export function ChainProvider({ children }) {
  const [endpoint, setEndpointState] = useState(
    () => localStorage.getItem("hs.ep") ?? ENDPOINTS[0]
  );
  const [status, setStatus] = useState("idle");
  const [latency, setLatency] = useState(null);
  const [props, setProps] = useState(null);
  const [round, setRound] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const endpointRef = useRef(endpoint);
  const roundRef = useRef(round);
  const blocksRef = useRef(blocks);
  endpointRef.current = endpoint;
  roundRef.current = round;
  blocksRef.current = blocks;

  const setEndpoint = useCallback((next) => {
    localStorage.setItem("hs.ep", next);
    setEndpointState(next);
    setStatus("idle");
  }, []);

  const request = useCallback(async (method, params, opts) => {
    try {
      const { result, endpoint: served, ms } = await call(
        endpointRef.current, method, params, opts
      );
      if (served !== endpointRef.current) {
        endpointRef.current = served;
        localStorage.setItem("hs.ep", served);
        setEndpointState(served);
      }
      setLatency(ms);
      setStatus("up");
      return result;
    } catch (err) {
      if (!opts?.signal?.aborted) setStatus("down");
      throw err;
    }
  }, []);

  const fetchBlock = useCallback(async (num, signal) => {
    let raw = null;
    try {
      raw = (await request("block_api.get_block", { block_num: num }, { signal }))?.block;
    } catch {
      try {
        raw = await request("condenser_api.get_block", [num], { signal });
      } catch {
        return null;
      }
    }
    if (!raw) return null;

    const ops = [];
    (raw.transactions ?? []).forEach((tx, i) => {
      normalizeOps(tx).forEach((op, j) =>
        ops.push({ ...op, trx: raw.transaction_ids?.[i] ?? null, key: `${num}:${i}:${j}` })
      );
    });
    return {
      num,
      by: raw.witness,
      at: raw.timestamp,
      txs: (raw.transactions ?? []).length,
      id: raw.block_id,
      ops,
    };
  }, [request]);

  useEffect(() => {
    const ctl = new AbortController();
    let timer;
    let running = false; // re-entrancy guard: a slow endpoint can make one
                          // pass outlast the interval, which without this
                          // produces two overlapping fetches of the same
                          // block range and doubled rows.

    async function poll() {
      if (running || ctl.signal.aborted) return;
      running = true;
      try {
        const gp = await request(
          "condenser_api.get_dynamic_global_properties", [], { signal: ctl.signal }
        );
        setProps(gp);

        if (!roundRef.current.length || gp.head_block_number % 21 === 0) {
          request("condenser_api.get_active_witnesses", [], { signal: ctl.signal })
            .then((w) => setRound(w ?? []))
            .catch(() => {});
        }

        const head = gp.head_block_number;
        const newest = blocksRef.current[0]?.num ?? head - CATCHUP;
        const from = Math.max(newest + 1, head - CATCHUP);
        const fetched = [];
        for (let n = from; n <= head; n++) {
          const b = await fetchBlock(n, ctl.signal);
          if (b) fetched.push(b);
        }
        if (fetched.length && !ctl.signal.aborted) {
          setBlocks((prev) => {
            const seen = new Set(prev.map((b) => b.num));
            const added = fetched.filter((b) => !seen.has(b.num)).reverse();
            return [...added, ...prev].sort((a, b) => b.num - a.num).slice(0, WINDOW);
          });
        }
      } catch {
        /* status already reflects the failure */
      } finally {
        running = false;
      }
    }

    poll();
    timer = setInterval(poll, POLL_MS);
    return () => {
      ctl.abort();
      clearInterval(timer);
    };
  }, [request, fetchBlock, endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ endpoint, setEndpoint, status, latency, props, round, blocks, request, fetchBlock }),
    [endpoint, setEndpoint, status, latency, props, round, blocks, request, fetchBlock]
  );

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
}

export function useChain() {
  const ctx = useContext(ChainContext);
  if (!ctx) throw new Error("useChain must be used inside <ChainProvider>");
  return ctx;
}
