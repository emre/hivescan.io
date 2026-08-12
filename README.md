# hivescan.io

A fast, lightweight Hive blockchain explorer that runs entirely in your browser. No backend, no server — just direct connections to Hive public nodes.

## Features

- **Live feed** of blocks and operations as they happen
- **Witness schedule** visualization showing current round status
- **Account profiles** with balances, Hive Power, voting power, and resource credits
- **Block details** with operations and transaction links
- **Transaction viewer** with raw JSON export
- **Operations filtering** by type with real-time counts
- **Dark/light mode** toggle
- **Search** for blocks, accounts, and transactions

## Running locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

The `dist/` folder contains plain static files that can be hosted anywhere — Netlify, Vercel, GitHub Pages, or any web server.

## How it works

hivescan.io connects directly to Hive public nodes via JSON-RPC. All data is fetched client-side, which means:

- No server-side infrastructure needed
- No data storage or tracking
- Works entirely in the browser
- Endpoint failover if a node goes down

## License

MIT
