import { useEffect, useState } from "react";

const KEYS = [
  ["/", "Focus search"],
  ["Esc", "Leave search"],
  ["Click a hash", "Copy it to the clipboard"],
  ["Click a row", "Expand its JSON payload"],
  ["Click a witness slot", "Go to that witness's account"],
  ["?", "Show or hide this list"],
];

/** A minimal reference for bindings that already exist elsewhere in the
 *  app — this adds no new behaviour, just makes the existing ones findable. */
export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "?") return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      setOpen((o) => !o);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="shelf" role="dialog" aria-label="Keyboard shortcuts" onClick={() => setOpen(false)}>
      <div className="shelf-in" onClick={(e) => e.stopPropagation()}>
        <table>
          <tbody>
            {KEYS.map(([key, desc]) => (
              <tr key={key}>
                <td className="m" style={{ whiteSpace: "nowrap", paddingRight: 16 }}>{key}</td>
                <td className="dim">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
