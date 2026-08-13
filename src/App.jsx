import { useRoute } from "./hooks/useHashRoute.js";
import Masthead from "./components/Masthead.jsx";
import Live from "./views/Live.jsx";
import Ops from "./views/Ops.jsx";
import Block from "./views/Block.jsx";
import Tx from "./views/Tx.jsx";
import Account from "./views/Account.jsx";
import Witnesses from "./views/Witnesses.jsx";

function View({ route }) {
  switch (route.name) {
    case "ops": return <Ops />;
    case "witnesses": return <Witnesses />;
    case "block": return <Block num={route.arg} />;
    case "tx": return <Tx id={route.arg} />;
    case "account": return <Account name={route.arg} />;
    default: return <Live />;
  }
}

export default function App() {
  const route = useRoute();

  return (
    <>
      <Masthead route={route} />
      <main className="wrap">
        {/* Remount on target change so state never leaks between records. */}
        <View key={`${route.name}:${route.arg ?? ""}`} route={route} />
      </main>
      <div className="wrap foot"><span className="dim">Built with 💜 by <a href="https://hive.blog/@emrebeyler" target="_blank" rel="noopener">emrebeyler</a>. Share your feedback on Hive.</span></div>
    </>
  );
}
