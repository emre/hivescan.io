import { useState } from "react";

/** images.hive.blog 404s for accounts that never set an avatar; hide rather
 *  than show a broken-image glyph, without reflowing the row. */
export default function Avatar({ name, small }) {
  const [broken, setBroken] = useState(false);
  return (
    <img
      className={small ? "av-s" : "av"}
      alt=""
      loading="lazy"
      style={broken ? { visibility: "hidden" } : undefined}
      src={`https://images.hive.blog/u/${encodeURIComponent(name)}/avatar`}
      onError={() => setBroken(true)}
    />
  );
}
