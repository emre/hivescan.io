import { useEffect, useRef, useState } from "react";

export default function Omnibox({ onSubmit }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement !== ref.current) {
        e.preventDefault();
        ref.current?.focus();
      }
      if (e.key === "Escape") ref.current?.blur();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <input
      id="q"
      ref={ref}
      value={value}
      placeholder="block, transaction id, or account"
      autoComplete="off"
      spellCheck="false"
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        onSubmit(value);
        setValue("");
        e.target.blur();
      }}
    />
  );
}
