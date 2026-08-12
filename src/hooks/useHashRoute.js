import { useSyncExternalStore } from "react";

function subscribe(cb) {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
}
const snapshot = () => location.hash || "#/";

export function hashFor(query) {
  const q = query.trim();
  if (!q) return null;
  if (/^\d+$/.test(q)) return `#/block/${q}`;
  if (/^[a-f0-9]{40}$/i.test(q)) return `#/tx/${q.toLowerCase()}`;
  return `#/@${q.replace(/^@/, "").toLowerCase()}`;
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot, snapshot);
  const parts = hash.slice(1).split("/").filter(Boolean);

  if (!parts.length) return { name: "live" };
  if (parts[0] === "ops") return { name: "ops" };
  if (parts[0] === "witnesses") return { name: "witnesses" };
  if (parts[0] === "block") return { name: "block", arg: parts[1] };
  if (parts[0] === "tx") return { name: "tx", arg: parts[1] };
  if (parts[0].startsWith("@")) return { name: "account", arg: parts[0].slice(1) };
  return { name: "live" };
}
