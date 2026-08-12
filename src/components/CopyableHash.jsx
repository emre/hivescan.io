import { useCopy } from "../hooks/useCopy.js";

export default function CopyableHash({ value }) {
  const [copied, copy] = useCopy();
  return (
    <div className="sub" data-copy title="Click to copy" onClick={() => copy(value)}>
      {copied ? "copied to clipboard" : value}
    </div>
  );
}
