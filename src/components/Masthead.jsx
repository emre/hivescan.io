import { ENDPOINTS } from "../lib/rpc.js";
import { useChain } from "../hooks/useChain.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { hashFor } from "../hooks/useHashRoute.js";
import Omnibox from "./Omnibox.jsx";

const TABS = [
  { href: "#/", name: "live", label: "blocks" },
  { href: "#/ops", name: "ops", label: "operations" },
  { href: "#/witnesses", name: "witnesses", label: "witnesses" },
];

export default function Masthead({ route }) {
  const { endpoint, setEndpoint } = useChain();
  const { theme, toggle } = useTheme();

  return (
    <div className="top">
      <div className="wrap">
        <div className="t1">
          <a className="id" href="#/">
            <span className="mark" aria-hidden="true" />
            hivescan.io
          </a>
          <nav className="nav">
            {TABS.map((t) => (
              <a key={t.name} href={t.href} className={route.name === t.name ? "on" : undefined}>
                {t.label}
              </a>
            ))}
          </nav>
          <Omnibox onSubmit={(q) => { const h = hashFor(q); if (h) location.hash = h; }} />
          <div className="ctl">
            <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} aria-label="Endpoint">
              {ENDPOINTS.map((e) => (
                <option key={e} value={e}>{e.replace("https://", "")}</option>
              ))}
            </select>
            <button onClick={toggle}>{theme === "dark" ? "light" : "dark"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
