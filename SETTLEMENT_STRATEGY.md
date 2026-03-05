# Imperium Settlement Strategy

> "Break the Chain. Own It."

## Core Principle: Settlement is Math, Not Opinion

Imperium is the **settlement layer** — it handles money, not metrics. Revenue flows in, splits are applied, money goes out. Transparent, instant, on-chain.

**Conviction stays in Palmlion/Oryx.** Conviction is a discovery and ranking signal. It should influence things *upstream* — access, pricing, token eligibility, fan tier — but never the payout split itself. If conviction influenced payouts, the settlement layer would be deciding who "deserves" what. That's a different product and it gets messy fast.

```
Palmlion/Oryx  →  Who cares the most     (conviction)
StanVault      →  Who are the real fans   (identity)
Imperium       →  Who gets paid what      (settlement)
```

## All Revenue Flows Through Imperium

The killer feature is one transparent ledger for every revenue stream — not just streaming royalties. The artist never has to reconcile across distributors, PROs, publishers, and promoters again.

### Revenue Sources

| Source | How It Enters | Current State |
|--------|---------------|---------------|
| **Streaming** (Spotify, Apple, Boomplay, Audiomack) | Distributor deposits for many songs at once via `batchDeposit` | Built — source tagged |
| **Live/Performance** | Venue/promoter deposits after show, or PRO (ASCAP, SAMRO) bulk deposit | Built — source tagged |
| **Sync/TV** | Publisher deposits lump sum after placement deal | Built — source tagged |
| **Tips** (Oryx) | Direct fan-to-artist flow through PayoutModule | Built — source tagged |
| **Fan Token Revenue** | ImperiumToken purchase → treasury → split | Built |
| **Merch** | Store deposits percentage after sale | Built — source tagged |
| **Publishing** | Publisher mechanical/performance royalties | Built — source tagged |

### Source Tags (Convention)

These are the standard `source` strings passed to `depositRoyalty`:

```
streaming     — Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, etc.
live          — Concert, festival, club performance
sync          — TV, film, commercial, game placement
tips          — Direct fan tips (Oryx)
tokens        — Fan token minting revenue
merch         — Merchandise sales
publishing    — Mechanical and performance royalties from publishers
radio         — Radio broadcast royalties
other         — Catch-all for unclassified revenue
```

## Contract Architecture

### PayoutModule — Universal Payment Router

The PayoutModule is deliberately dumb. It doesn't decide how much anyone earns. It just:

1. **Receives** deposits tagged with source + region
2. **Splits** according to RoyaltySplit configuration
3. **Holds** claimable balances per recipient
4. **Pays out** when recipients claim

```
Revenue In (any source)
    │
    ▼
PayoutModule.depositRoyalty(songId, amount, token, source, region)
    │
    ▼
RoyaltySplit.calculatePayout(songId, amount)
    │
    ├──▶ Artist:   70% → claimable balance
    ├──▶ Producer: 20% → claimable balance
    └──▶ Writer:   10% → claimable balance

Recipients claim whenever they want.
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `depositRoyalty(songId, amount, token, source, region)` | Single deposit from any source |
| `batchDeposit(songIds[], amounts[], token, source, region)` | Distributor deposits for many songs at once |
| `distributeRoyalty(payoutId)` | Apply splits and credit claimable balances |
| `batchDistribute(payoutIds[])` | Distribute many payouts at once |
| `claimRoyalties(token)` | Recipient claims their balance for a specific token |
| `claimAllRoyalties()` | Recipient claims all balances across all tokens |

### Revenue Tracking

| Function | What It Returns |
|----------|----------------|
| `getTotalEarnings(songId)` | Total lifetime earnings for a song |
| `getSongSourceEarnings(songId, source)` | Earnings by source for a song (e.g., "how much did Song #1 earn from streaming?") |
| `getSourceEarnings(source)` | Total platform earnings by source |
| `getRegionEarnings(region)` | Total platform earnings by region |

## What Conviction Does NOT Do Here

Conviction (Palmlion), Stan Score (StanVault), and other metrics influence the ecosystem **upstream** of settlement:

| Metric | Where It Matters | NOT in Settlement |
|--------|-----------------|-------------------|
| **Conviction Score** | Token purchase eligibility, discovery ranking | Does NOT change split % |
| **Stan Score** | Presale access, exclusive content, Discord roles | Does NOT change payout amounts |
| **SCR** | Content strategy (Slayt), fan retention alerts | Does NOT affect who gets paid |

Settlement is neutral. If the split says 70/20/10, that's what gets paid regardless of how popular the artist is or how convicted the fans are.

## Ecosystem Flow

```
1. Artist registers song          → SongRegistry
2. Configures splits (70/20/10)   → RoyaltySplit
3. Distributor deposits $1000     → PayoutModule (source: "streaming", region: "US")
4. Promoter deposits $500         → PayoutModule (source: "live", region: "NG")
5. Fan tips $50                   → PayoutModule (source: "tips", region: "KE")
6. Total: $1550
   ├── Artist claims  $1085 (70%)
   ├── Producer claims  $310 (20%)
   └── Writer claims    $155 (10%)
7. All on-chain, all transparent, all instant
```

## Revenue Source Reporting (Webhook to Ecosystem)

When payouts happen, Imperium broadcasts to all ecosystem apps:

```javascript
POST /api/webhook/imperium/payout
{
  event: "royalty_payout",
  song_id: "1",
  total_amount_usdc: 1550,
  source_breakdown: {
    streaming: 1000,
    live: 500,
    tips: 50
  },
  splits: [
    { recipient: "artist", amount: 1085, wallet: "0x..." },
    { recipient: "producer", amount: 310, wallet: "0x..." },
    { recipient: "writer", amount: 155, wallet: "0x..." }
  ],
  tx_hash: "0x...",
  chain: "polygon"
}
```

Each app uses this for:
- **StanVault**: Update fan's lifetime value contribution
- **Palmlion**: Show real earnings from tips (not just counts)
- **Slayt**: Revenue attribution per post ("this content drove $X")
- **Starforge**: Artist earnings dashboard with source breakdown

## Future: Automated Deposits

Phase 1 (now): Manual deposits by admin/depositor role — distributor reports, manually entered.

Phase 2: API integrations with distributors (DistroKid, TuneCore) that auto-deposit when royalties arrive.

Phase 3: PRO integration (ASCAP, BMI, SAMRO) for automated performance royalty deposits.

The contract doesn't need to change for any of these phases — only the deposit automation layer above it.
