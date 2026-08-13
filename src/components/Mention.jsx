import { accountPath } from "../lib/url.js";

export default function Mention({ name }) {
  if (!name) return null;
  const label = String(name);
  return <a href={accountPath(label)}>{label}</a>;
}
