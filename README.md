# IMPERIUM

**Your royalties. On-chain. Instant. Yours.**

---

## The Dream

A world where every stream, every sync, every play translates to money in the creator's wallet within seconds—not months. Where the flow of royalties is as visible as water running downhill. Where fans can directly back the artists they believe in and share in their success. No middlemen skimming. No black boxes hiding your money. No waiting.

---

## The Problem

The music industry runs on a broken royalty system.

**Opacity**: Labels, distributors, and PROs operate black boxes. Creators have no idea where their money comes from, where it goes, or how much is being taken along the way. Quarterly statements arrive months late with unexplainable line items.

**Delay**: A Spotify stream today might pay out in 3-6 months. The money passes through 4-7 intermediaries, each taking time (and a cut) before anything reaches the creator.

**Fragmentation**: Royalties arrive from dozens of sources—streaming, sync, mechanical, performance—each with different reporting standards, payment schedules, and error rates. Reconciliation is a full-time job.

**Unclaimed Money**: Billions sit in royalty databases unclaimed because the data linking payments to creators is broken. The industry calls these "black boxes." They're not accidents—they're systemic failures that benefit incumbents.

**Zero Creator Control**: Splits between collaborators are negotiated in emails and contracts that get lost, disputed, or ignored. Changing a split requires lawyers. Verifying a payment requires trust.

---

## Guiding Policy

Imperium is built on three non-negotiable principles:

### 1. On-Chain Truth
Every song registration, every split configuration, every royalty deposit, every payout—permanently recorded on Polygon. No disputes about who owns what percentage. No "our records show differently." The blockchain is the single source of truth.

### 2. Instant Settlement
When royalties hit the platform, they're distributed to recipients in the same transaction. Not tomorrow. Not next quarter. Now. USDC lands in your wallet the moment it's owed.

### 3. Radical Transparency
A 3D globe visualization shows royalty flows in real-time. Creators see exactly which platforms paid, from which regions, for which songs. Every basis point is accounted for.

**Technical strengths that enable this:**
- Polygon L2 for sub-cent transaction costs
- ERC-1155 fractional tokens for fan investment
- Chainlink oracles for ISRC verification
- IPFS/Arweave for immutable metadata
- Smart contract splits that execute automatically

---

## Strategy

### What Imperium Solves

| Problem | Imperium Solution |
|---------|-------------------|
| Opaque royalty flows | On-chain transaction history, real-time analytics dashboard |
| 3-6 month payment delays | Instant USDC distribution on deposit |
| Split disputes | Immutable smart contract configurations, optional permanent locks |
| Unclaimed royalties | Black Box Hunter AI scans legacy databases for owed payments |
| No fan participation | ERC-1155 fractional ownership tokens with royalty share |
| Fragmented reporting | Unified dashboard tracking all sources and regions |

### How It Works

**For Creators:**
1. Connect wallet, register song with ISRC code
2. Configure royalty splits between collaborators (basis point precision)
3. Optionally lock splits permanently (irreversible, trustless)
4. Optionally mint fractional tokens for fan investment
5. Royalties deposited → automatically split → instantly claimable

**For Fans:**
1. Browse registered songs
2. Purchase fractional ownership tokens (USDC or MATIC)
3. Receive proportional royalty share (up to 50% of song earnings)
4. Hold, trade, or burn tokens

**Smart Contract Architecture:**
- `SongRegistry.sol` — Immutable song database with ISRC verification
- `RoyaltySplit.sol` — Configurable, lockable percentage splits
- `PayoutModule.sol` — Automatic distribution engine
- `ImperiumToken.sol` — ERC-1155 fractional ownership

---

## Who This Is For

**Independent artists** who want to see exactly where their money comes from and receive it immediately.

**Producers and collaborators** tired of chasing splits through email chains and verbal agreements.

**Small labels** seeking transparent, automated royalty distribution without expensive backend infrastructure.

**Music investors** looking for direct, verifiable exposure to song performance without intermediaries.

**Web3-native creators** who already understand wallets, on-chain transactions, and want their music income to match their values.

---

## Who This Is NOT For

**Artists who don't control their masters.** If a label owns your recordings, you can't register them here. This is for creators who own what they make.

**Anyone expecting fiat payouts.** Imperium pays in USDC on Polygon. If you need bank deposits, you'll need an off-ramp.

**People uncomfortable with crypto.** You need a wallet. You need to understand gas fees (though Polygon's are minimal). There's no "connect your Spotify" magic button.

**Those seeking advances or funding.** Imperium distributes royalties—it doesn't provide upfront capital. Fan tokens are investments in future earnings, not loans.

**Major label operations.** The existing system works for incumbents. They have no incentive to adopt transparency. This is for everyone else.

---

## Tech Stack

- **Blockchain**: Polygon (Solidity 0.8.20, OpenZeppelin)
- **Frontend**: Next.js 14, React 18, TailwindCSS, Deck.gl
- **Web3**: wagmi, viem, ethers.js, RainbowKit
- **Backend**: Node.js, Express, Redis, Supabase
- **Storage**: IPFS (Pinata), Arweave
- **Oracles**: Chainlink
- **Indexing**: The Graph, Covalent

---

## Status

**Phase 1 (MVP)**: Complete
- Song registration with ISRC
- Configurable royalty splits
- Instant USDC payouts
- Fractional fan tokens
- Real-time analytics dashboard
- Global royalty visualization

**Phase 2**: In Development
- ZK privacy for split configurations
- Black Box Hunter automation
- Mobile applications

---

## License

MIT
