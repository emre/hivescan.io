import { useChain } from "../hooks/useChain.jsx";
import { N } from "../lib/format.js";

/** One line of running text, not a card grid — the status is content, not chrome. */
export default function StatusLine() {
  const { status, props, blocks, endpoint, latency } = useChain();

  if (status === "down") return <span className="pulse off">no endpoint responding</span>;
  if (!props) return <span className="pulse">connecting</span>;

  const lag = props.head_block_number - props.last_irreversible_block_num;
  const window = blocks.slice(0, 10);
  const rate = window.length
    ? window.reduce((a, b) => a + b.ops.length, 0) / (window.length * 3)
    : 0;

  return (
    <span className="pulse">
      head <b>{N(props.head_block_number)}</b>
      {lag > 1 && <> · finality lag <b>{lag} blk</b></>}
      {" · "}<b>{rate.toFixed(1)}</b> ops/s
      {" · "}<span className="hide-s">{endpoint.replace("https://", "")} <b>{latency}ms</b></span>
    </span>
  );
}
