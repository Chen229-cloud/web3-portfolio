# 🚀 Web3 Portfolio

![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-fff100)
![Tests](https://img.shields.io/badge/Tests-31/31_passing-brightgreen)
![CI](https://github.com/Chen229-cloud/web3-portfolio/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue)

Full-stack Web3 dApp portfolio: 7 Solidity contracts across DeFi, NFT, DAO, and utility patterns.

---

## 📦 Contracts

| Contract | Type | Key Features |
|----------|------|--------------|
| `Counter.sol` | Utility | On-chain counter with events |
| `MyToken.sol` | ERC-20 | OpenZeppelin, Ownable minting |
| `MyNFT.sol` | ERC-721 | 1000 supply, 0.01 ETH mint |
| `Faucet.sol` | Utility | 0.05 ETH/drip, 1hr cooldown |
| `SimpleDEX.sol` | DeFi | AMM x·y=k, 0.3% fee, liquidity |
| `Staking.sol` | DeFi | Stake ERC-20, earn rewards per second |
| `SimpleDAO.sol` | Governance | Proposals, token-weighted voting, quorum |

## 🧪 Tests

```
  31 passing (1s)

  Counter     6 passed
  MyToken     4 passed
  MyNFT       3 passed
  SimpleDEX   7 passed
  Staking     6 passed
  SimpleDAO   5 passed
```

## 🛠 Stack

**Solidity 0.8.27** · **Hardhat** · **OpenZeppelin v5** · **ethers.js v6** · **Chai**

## ⚡ Quick Start

```bash
git clone https://github.com/Chen229-cloud/web3-portfolio.git
cd web3-portfolio
npm install
npx hardhat compile
npx hardhat test        # 31 tests
npx hardhat node        # local chain
npx hardhat run scripts/deploy.js --network localhost
```

## 🤖 CI/CD

GitHub Actions auto-runs `compile` + `test` on every push and PR.

---

**Chen229-cloud** — open to Web3 freelance & bounties.