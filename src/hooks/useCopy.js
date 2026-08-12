import { useCallback, useState } from "react";

/** Click-to-copy: swaps a flag for ~900ms so the caller can show feedback. */
export function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    }).catch(() => {});
  }, []);

  return [copied, copy];
}
