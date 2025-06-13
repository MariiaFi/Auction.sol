# Auction Smart Contract

A simple Solidity auction contract where the highest bidder wins. Supports:
- Bid placement with ETH
- Refunds for outbid users
- Timed auction ending
- Secure funds withdrawal

## Contract Overview

- **Language:** Solidity ^0.8.30  
- **Contract Name:** `Auction`  
- **Key Features:**
  - Bidding with ETH
  - Refundable bids
  - Seller-controlled auction
  - Emits events for tracking

## Functions

| Function                                  | Description                                       |
|-------------------------------------------|---------------------------------------------------|
| `constructor(uint _biddingTimeInSeconds)` | Initializes the auction duration                  |
| `bid()`                                   | Allows users to place a higher bid                |
| `withdraw()`                              | Lets outbid users withdraw their previous bids    |
| `endAuction()`                            | Ends the auction and transfers funds to the seller|

## Quick Start (Hardhat)

1. **Install dependencies**

```bash
npm init -y
npm install --save-dev hardhat
npx hardhat
```
2 **Add the contract**

Place Auction.sol inside the contracts/ folder.

3. **Deploy script (scripts/deploy.js)**
```
const hre = require("hardhat");

async function main() {
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(300); // 300 seconds (5 minutes)
  await auction.deployed();
  console.log(`Auction deployed at: ${auction.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```
4. Run the deploy
```
npx hardhat run scripts/deploy.js --network hardhat
```
## Security Notes
Refunds use call instead of transfer for safety.

Only the seller can receive the winning bid.

Auction cannot be ended before the time expires.

## License
MIT — free to use, modify, distribute.

