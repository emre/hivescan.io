import { memo } from "react";
import { N, since } from "../lib/format.js";
import { accountPath, blockPath } from "../lib/url.js";
import Avatar from "./Avatar.jsx";

/** Keyed by block number in the parent — React keeps this node alive across
 *  polls, so the arrival tint fires once on mount and never replays. */
function BlockRow({ block, lastIrreversible }) {
  const pending = block.num > lastIrreversible;
  return (
    <tr>
      <td className="m"><a href={blockPath(block.num)}>{N(block.num)}</a></td>
      <td>
        <a href={accountPath(block.by)}>
          <Avatar name={block.by} small />
          {block.by}
        </a>
      </td>
      <td className="m dim r">{since(block.at)}</td>
      <td className="m r">{block.txs}</td>
      <td className="m r">{block.ops.length}</td>
      <td className="m r">{pending && <span style={{ color: "var(--red)" }}>settling</span>}</td>
    </tr>
  );
}

export default memo(BlockRow);
