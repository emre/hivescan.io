export default function Mention({ name }) {
  if (!name) return null;
  return <a href={`#/@${name}`}>{name}</a>;
}
