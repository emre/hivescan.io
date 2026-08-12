# hivescan.io

A client-side Hive block explorer. No backend, no indexer — the browser talks
JSON-RPC directly to public consensus nodes, which serve permissive CORS headers.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

`dist/` is plain static files. Any host works: Pages, Netlify, S3, a USB stick.

## Structure

```
src/
  lib/
    rpc.js          transport — timeout, endpoint failover, latency measurement
    format.js       VESTS→HP, asset parsing, manaPercent (shared by RC + voting power)
    ops.js          operation families (val/soc/rwd/gov/json), token-based summaries
  hooks/
    useChain.jsx    the single poller; provides chain state via context
    useHashRoute.js hash routing + omnibox type-sniffing
    useAsync.js     async fetch with stale-result discarding
    useTheme.js     light/dark, persisted, light by default per brand palette
    useCopy.js      click-to-copy with a timed "copied" flag
  components/       presentational, no data fetching
  views/            one per route
```

Only `useChain` polls. Every other component reads from context.

## Design notes

**Every operation listing is a real `<table>`.** `OpEntry` renders a pair of
`<tr>`s — the row itself, and a JSON row that appears beneath it when
expanded. Columns are `[block?] fam type summary [extra?]`; block number and
the trailing column are optional per view (the stream shows a block column,
a block's own page doesn't; account history shows both block and age). The
JSON row's `colSpan` is derived from which columns are present, not passed
in by each caller — one less thing to get out of sync.

**Mentions are links, not HTML strings.** `lib/ops.js` doesn't return HTML —
it returns a token list (`{mention: name}` or `{text: "..."}`), and
`<OpSummary>` renders that as real `<Mention>` components. No
`dangerouslySetInnerHTML` anywhere in the app.

**Rows are keyed, so React does the diffing.** `key={b.num}` on a block row
means React preserves the DOM node across polls — no manual reconciliation,
no arrival animation replaying on unrelated rows.

**The operations stream freezes while a payload is open.** `views/Ops.jsx`
keeps a `frozen` snapshot of the live list and only refreshes it once
`opened.size` returns to zero — gated on that count, not on the incoming
data, so the moment the last payload closes the backlog appears immediately
rather than on the next poll tick.

**Endpoint failover is visible.** `lib/rpc.js` walks the endpoint list and
reports which node actually answered; `useChain` promotes it to default and
the header shows it, always.

**Detail views remount on target change** via the `key` on `<View>` in
`App.jsx`, so expanded payloads and scroll state never leak between records.

## Known limits

Everything must be reachable by block number, transaction id, or account
name. There is no indexer, so aggregate queries ("all transfers over 1000
HIVE last week") are out of scope — that is what HAF exists for.

- Account history is backwards-paginated, capped around 30 shown here
- Transaction lookup by id needs `account_history_api` with
  `transaction_indexing`; not every public node enables it
- Witness detail (`get_witness_by_account`) is folded into the account page
  rather than a separate route, since an account and a witness are the same
  identity — splitting them would mean either duplicating balance/history
  data or making people choose which URL to visit
- No price history without a third-party API
- Aggressive polling will get rate-limited; `POLL_MS` in `useChain.jsx` is
  the knob

## Branding

Hive Red `#E31337`, Hive Black `#212529`, Hive LightGrey `#f0f0f8`,
Hive Grey `#e7e7f1`. Light by default — the palette is a light-mode spec.
Dark-mode canvas and rule values are derived by stepping the Hive Black hue;
no additional hue is introduced.

The mark in `src/mark.js` is applied as a CSS mask, so it inherits
`var(--red)` rather than carrying a baked-in colour.

## This pass

- **Tab titles.** `useTitle()` sets `document.title` per view — block number,
  transaction id, account name — so browser history and shared tabs are
  actually distinguishable instead of forty identical "hivescan.io" entries.
- **Static favicons + OG/Twitter cards.** `public/` holds a recoloured
  (Hive Red) favicon set and a 1200×630 OG image generated once from the
  source mark — no runtime generation. `og:image` is hardcoded to
  `https://hivescan.io/og.png`; update that in `index.html` if this deploys
  elsewhere, since link-unfurl crawlers don't execute JS to resolve a
  relative path.
- **Skeletons, not "Loading…".** `components/Skeleton.jsx` renders
  table-shaped placeholders sized to roughly match the real content, so nothing
  jumps when data arrives. Applied everywhere a fetch was previously a bare
  loading string.
- **`?` shortcuts overlay.** Lists bindings that already existed —
  `/` to search, `Esc` to leave it, click-to-copy, click-to-expand — so
  they're discoverable rather than tribal knowledge.
