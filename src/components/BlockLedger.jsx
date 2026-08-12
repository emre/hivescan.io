import { useChain } from "../hooks/useChain.jsx";
import BlockRow from "./BlockRow.jsx";
import { SkeletonRows } from "./Skeleton.jsx";

export default function BlockLedger() {
  const { blocks, props } = useChain();
  const lib = props?.last_irreversible_block_num ?? 0;

  return (
    <table>
      <colgroup>
        <col style={{ width: 132 }} /><col /><col style={{ width: 64 }} />
        <col style={{ width: 52 }} /><col style={{ width: 52 }} /><col style={{ width: 70 }} />
      </colgroup>
      <thead>
        <tr><th>block</th><th>witness</th><th className="r">age</th>
          <th className="r">txs</th><th className="r">ops</th><th className="r"></th></tr>
      </thead>
      <tbody>
        {blocks.length
          ? blocks.map((b) => <BlockRow key={b.num} block={b} lastIrreversible={lib} />)
          : <SkeletonRows cols={6} rows={8} />}
      </tbody>
    </table>
  );
}
