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

/** Path segments are percent-encoded in location.pathname; a malformed
 *  escape would throw, so a bad URL degrades to the live view. */
function decodeParts(path) {
  try {
    return path.slice(1).split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return [];
  }
}

export function useRoute() {
  const path = useSyncExternalStore(subscribe, snapshot, snapshot);
  const parts = decodeParts(path);

  if (!parts.length) return { name: "live" };
  if (parts[0] === "ops") return { name: "ops" };
  if (parts[0] === "witnesses") return { name: "witnesses" };
  // A record view without its identifier has nothing to fetch — the views
  // read arg unconditionally, so never hand them a route missing one.
  if (parts[0] === "block") return parts[1] ? { name: "block", arg: parts[1] } : { name: "live" };
  if (parts[0] === "tx") return parts[1] ? { name: "tx", arg: parts[1] } : { name: "live" };
  if (parts[0].startsWith("@")) {
    const name = parts[0].slice(1);
    return name ? { name: "account", arg: name } : { name: "live" };
  }
  return { name: "live" };
}
