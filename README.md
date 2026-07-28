# Web3 dApp Portfolio

## Tech Stack
- **Solidity 0.8.27** — Smart contracts
- **Hardhat** — Dev environment & testing
- **OpenZeppelin** — Standard contract libraries
- **ethers.js v6** — Frontend blockchain interaction

## Contracts

| Contract | Description | Tests |
|----------|-------------|-------|
| `Counter.sol` | On-chain counter with increment/decrement/reset | 6 ✅ |
| `MyToken.sol` | ERC-20 token with owner-only minting | 4 ✅ |
| `MyNFT.sol` | ERC-721 NFT collection (max 1000, 0.01 ETH mint) | 3 ✅ |
| `Faucet.sol` | ETH faucet with 1-hour cooldown, 0.05 ETH per drip | — |

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (13 passing)
npx hardhat test

# Start local blockchain
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Open the frontend
# Open frontend/index.html in browser
# Connect MetaMask to localhost:8545
```

## Deploy to Sepolia Testnet

```bash
# Set your keys
set SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
set PRIVATE_KEY=your_wallet_private_key

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

## Frontend
Open `frontend/index.html` in browser. Features:
- 💧 Faucet — Request 0.05 ETH (1 hour cooldown)
- 🔢 Counter — Increment/decrement/reset on-chain
- 🪙 Token — View balance, mint new tokens (owner only)
- 🖼️ NFT — Mint NFTs for 0.01 ETH