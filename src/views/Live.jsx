import { useTitle } from "../hooks/useTitle.js";
import { useChain } from "../hooks/useChain.jsx";
import StatusLine from "../components/StatusLine.jsx";
import RoundComb from "../components/RoundComb.jsx";
import BlockLedger from "../components/BlockLedger.jsx";
import { SectionHead } from "../components/Facts.jsx";

const NOOP = new Set();

export default function Live() {
  useTitle(null);
  const { blocks } = useChain();

  return (
    <>
      <RoundComb />
      <SectionHead>Blocks<span>one every three seconds</span></SectionHead>
      <BlockLedger />
    </>
  );
}
