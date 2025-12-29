# ⬡ IMPERIUM

> **Own It. Break the Chain. No Masters. Take the Throne.**

A decentralized music royalty platform built on Polygon that solves the black box royalty problem, tokenizes royalties, and gives creators and fans control over music earnings.

![Imperium Banner](https://via.placeholder.com/1200x400/0A0A0F/FFD700?text=IMPERIUM+-+Music+Royalty+Platform)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [Backend](#backend)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Platform
- **Song Registry** - Immutable on-chain registration with ISRC codes
- **Royalty Splits** - Configurable splits between creators, producers, and labels
- **Instant Payouts** - USDC royalty distribution with no delays
- **Fractional Ownership** - ERC-1155 tokens for fan investment

### Visualization
- **Global Heatmap** - Real-time 3D globe showing royalty flows
- **Analytics Dashboard** - Earnings by source, region, and time

### Advanced Features
- **Black Box Hunter** - AI-powered unclaimed royalty finder
- **ZK Privacy** - Zero-knowledge proofs for private splits (Phase 2)
- **Oracle Integration** - Chainlink for streaming data verification
- **IPFS/Arweave** - Decentralized metadata storage

---

## Architecture

```
imperium/
├── contracts/              # Solidity smart contracts
│   ├── SongRegistry.sol    # Song registration
│   ├── RoyaltySplit.sol    # Split configuration
│   ├── PayoutModule.sol    # Royalty distribution
│   ├── ImperiumToken.sol   # ERC-1155 fractional tokens
│   └── ZKPrivacySplits.sol # ZK privacy layer (Phase 2)
│
├── frontend/               # Next.js frontend
│   ├── pages/              # App pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
│
├── backend/                # Node.js API server
│   ├── routes/             # API endpoints
│   └── services/           # Off-chain services
│
├── scripts/                # Deployment scripts
└── test/                   # Test suites
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask or WalletConnect compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/imperium.git
cd imperium

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your configuration:

```env
# Blockchain
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_api_key

# Frontend
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Backend
PORT=3001
```

### Local Development

```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contracts (in new terminal)
npm run deploy:local

# Terminal 3: Start frontend
npm run frontend

# Terminal 4: Start backend (optional)
npm run backend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Smart Contracts

### SongRegistry.sol

Immutable registry for song metadata.

```solidity
// Register a new song
function registerSong(
    string isrc,
    string title,
    string metadataURI,
    bytes32 contentHash
) returns (uint256 songId)

// Verify song ownership
function verifySong(uint256 songId) external
```

### RoyaltySplit.sol

Configure royalty distributions.

```solidity
// Configure splits (must total 100%)
function configureSplits(
    uint256 songId,
    address[] recipients,
    uint256[] percentages,  // basis points (10000 = 100%)
    string[] roles
) external

// Lock splits permanently
function lockSplits(uint256 songId) external
```

### PayoutModule.sol

Distribute and claim royalties.

```solidity
// Deposit royalties for a song
function depositRoyalty(
    uint256 songId,
    uint256 amount,
    address token,
    string source,
    string region
) external returns (uint256 payoutId)

// Claim accumulated royalties
function claimRoyalties(address token) external
```

### ImperiumToken.sol

ERC-1155 fractional ownership tokens.

```solidity
// Create tokens for a song
function createToken(
    uint256 songId,
    uint256 maxSupply,
    uint256 pricePerToken,
    address paymentToken,
    uint256 royaltyShareBps,
    string uri
) external returns (uint256 tokenId)

// Purchase tokens
function mintTokens(uint256 tokenId, uint256 amount) external payable
```

---

## Frontend

Built with Next.js, React, and TailwindCSS.

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Creator dashboard |
| `/upload` | Register new songs |
| `/map` | Global royalty visualization |

### Key Components

- `Navbar` - Navigation with wallet connect
- `RoyaltyCard` - Song earnings card
- `RoyaltyGlobe` - 3D globe visualization

### Hooks

```typescript
// Get creator's songs
const { data: songs } = useCreatorSongs(address);

// Register a new song
const { registerSong, isPending } = useRegisterSong();

// Claim royalties
const { claimAllRoyalties } = useClaimRoyalties();
```

---

## Backend

Node.js API server for off-chain services.

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/songs` | List registered songs |
| `GET /api/royalties/flows` | Real-time flow data |
| `POST /api/ipfs/upload` | Upload to IPFS |
| `POST /api/oracle/verify-isrc` | Verify ISRC code |

### Black Box Hunter

Automated service to find unclaimed royalties:

```javascript
const { blackBoxHunter } = require('./services/blackBoxHunter');

// Scan all databases
const results = await blackBoxHunter.scanAllDatabases();

// Get pending claims
const claims = blackBoxHunter.getPendingClaims();
```

---

## Deployment

### Polygon Mainnet

```bash
# Compile contracts
npm run compile

# Deploy to Polygon
npm run deploy:polygon

# Verify on Polygonscan
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Mumbai Testnet

```bash
npm run deploy:mumbai
```

### Frontend (Vercel)

```bash
cd frontend
npx vercel
```

---

## API Reference

### Songs API

```http
GET /api/songs
GET /api/songs/:id
GET /api/songs/isrc/:isrc
POST /api/songs/verify
```

### Royalties API

```http
GET /api/royalties/flows?range=7d
GET /api/royalties/claimable/:address
GET /api/royalties/sources
GET /api/royalties/regions
```

### Oracle API

```http
POST /api/oracle/verify-isrc
GET /api/oracle/streaming-data/:isrc
POST /api/oracle/request-payout
```

---

## Testing

```bash
# Run contract tests
npm run test

# Run with coverage
npm run coverage

# Run gas reporter
REPORT_GAS=true npm run test
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Deployer wallet key | Yes |
| `POLYGON_RPC_URL` | Polygon RPC endpoint | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | No |
| `PINATA_API_KEY` | Pinata IPFS key | No |
| `COVALENT_API_KEY` | Covalent indexing | No |

### Contract Addresses

After deployment, addresses are saved to:
- `deployments/<network>.json`
- `frontend/lib/contracts.ts`

---

## Roadmap

### Phase 1 (MVP) ✅
- [x] Song Registry contract
- [x] Royalty Split configuration
- [x] Payout Module
- [x] Fractional ownership tokens
- [x] Frontend dashboard
- [x] Global visualization

### Phase 2 (Q2 2024)
- [ ] ZK Privacy for splits
- [ ] AI royalty predictions
- [ ] Automated Black Box Hunter
- [ ] Mobile app

### Phase 3 (Q3 2024)
- [ ] Cross-chain support
- [ ] DAO governance
- [ ] Royalty prediction markets
- [ ] Label integrations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Polygon (EVM) |
| Smart Contracts | Solidity, OpenZeppelin |
| Frontend | Next.js, React, TailwindCSS |
| Web3 | ethers.js, wagmi, RainbowKit |
| Visualization | Deck.gl, Mapbox |
| Backend | Node.js, Express |
| Storage | IPFS (Pinata), Arweave |
| Indexing | The Graph, Covalent |
| Oracles | Chainlink |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- Documentation: [docs.imperium.music](https://docs.imperium.music)
- Discord: [discord.gg/imperium](https://discord.gg/imperium)
- Twitter: [@ImperiumMusic](https://twitter.com/ImperiumMusic)

---

<div align="center">

**⬡ IMPERIUM ⬡**

*Own It. Break the Chain. No Masters. Take the Throne.*

Built with ❤️ for the music community

</div>
