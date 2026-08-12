import { summaryTokens } from "../lib/ops.js";
import Mention from "./Mention.jsx";

/** Renders a gist as real links, not an HTML string — no dangerouslySetInnerHTML. */
export default function OpSummary({ name, data }) {
  const tokens = summaryTokens(name, data);
  return (
    <span className="sm">
      {tokens.map((tok, i) =>
        tok.mention ? <Mention key={i} name={tok.mention} /> : <span key={i}>{tok.text}</span>
      )}
    </span>
  );
}
