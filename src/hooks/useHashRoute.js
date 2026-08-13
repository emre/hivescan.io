import { useSyncExternalStore } from "react";

const snapshot = () => location.pathname;

function subscribe(cb) {
  function onPopState() {
    cb();
  }
  function onClick(e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const a = e.target.closest("a");
    if (!a || a.target) return;
    if (a.origin !== location.origin) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    e.preventDefault();
    navigate(a.pathname);
  }
  addEventListener("popstate", onPopState);
  addEventListener("click", onClick, true);
  return () => {
    removeEventListener("popstate", onPopState);
    removeEventListener("click", onClick, true);
  };
}

export function navigate(path) {
  history.pushState(null, "", path);
  dispatchEvent(new PopStateEvent("popstate"));
}

export function pathFor(query) {
  const q = query.trim();
  if (!q) return null;
  if (/^\d+$/.test(q)) return `/block/${q}`;
  if (/^[a-f0-9]{40}$/i.test(q)) return `/tx/${q.toLowerCase()}`;
  return `/@${q.replace(/^@/, "").toLowerCase()}`;
}

export function useRoute() {
  const path = useSyncExternalStore(subscribe, snapshot, snapshot);
  const parts = path.slice(1).split("/").filter(Boolean);

  if (!parts.length) return { name: "live" };
  if (parts[0] === "ops") return { name: "ops" };
  if (parts[0] === "witnesses") return { name: "witnesses" };
  if (parts[0] === "block") return { name: "block", arg: parts[1] };
  if (parts[0] === "tx") return { name: "tx", arg: parts[1] };
  if (parts[0].startsWith("@")) return { name: "account", arg: parts[0].slice(1) };
  return { name: "live" };
}
