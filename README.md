# 🚀 Web3 Portfolio

![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-fff100?logo=hardhat)
![Tests](https://img.shields.io/badge/Tests-20/20_passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack Web3 dApp portfolio showcasing smart contract development, testing, and frontend integration skills.

---

## 📦 Contracts

| Contract | Type | Description | Key Features |
|----------|------|-------------|--------------|
| `Counter.sol` | Utility | On-chain counter | increment / decrement / reset / events |
| `MyToken.sol` | ERC-20 | Standard token | OpenZeppelin, Ownable minting, 1M supply |
| `MyNFT.sol` | ERC-721 | NFT collection | 1000 max supply, 0.01 ETH mint, owner withdraw |
| `Faucet.sol` | Utility | ETH faucet | 0.05 ETH/drip, 1hr cooldown, fundable |
| `SimpleDEX.sol` | DeFi | AMM exchange | x·y=k, 0.3% fee, add/remove liquidity, swap |

## 🧪 Tests

```
  20 passing (768ms)

  Counter       6 passed
  MyToken       4 passed
  MyNFT         3 passed
  SimpleDEX     7 passed
```

## 🛠 Tech Stack

- **Solidity 0.8.27** — Smart contracts
- **Hardhat** — Development & testing framework
- **OpenZeppelin v5** — Standard contract libraries
- **ethers.js v6** — Frontend blockchain interaction
- **Chai + Mocha** — Testing

## ⚡ Quick Start

```bash
git clone https://github.com/Chen229-cloud/web3-portfolio.git
cd web3-portfolio
npm install
npx hardhat compile
npx hardhat test
```

### Run Locally

```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Open frontend/index.html in browser
# Connect MetaMask to localhost:8545
```

## 🌐 Deploy to Sepolia

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your keys:
#   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
#   PRIVATE_KEY=your_wallet_private_key

npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🖥 Frontend

Open `frontend/index.html` — zero build step, single file:

- 💧 **Faucet** — Request test ETH, deposit funds
- 🔢 **Counter** — Increment/decrement on-chain
- 🪙 **Token** — View balance, mint tokens (owner)
- 🖼️ **NFT** — Mint NFTs with ETH payment

Contract addresses auto-loaded from `deployments.json`.

## 📂 Structure

```
web3-portfolio/
├── contracts/
│   ├── Counter.sol
│   ├── MyToken.sol       (ERC-20)
│   ├── MyNFT.sol         (ERC-721)
│   ├── Faucet.sol
│   └── SimpleDEX.sol     (AMM x*y=k)
├── test/
│   ├── Counter.test.js
│   ├── MyToken.test.js
│   ├── MyNFT.test.js
│   └── SimpleDEX.test.js
├── scripts/
│   └── deploy.js          (one-click deploy)
├── frontend/
│   ├── index.html         (dApp interface)
│   └── deployments.json   (auto-generated)
├── hardhat.config.js
└── README.md
```

## 👤 Author

**Chen229-cloud** — Web3 Developer

Open to freelance gigs, Gitcoin bounties, and Web3 collaborations.