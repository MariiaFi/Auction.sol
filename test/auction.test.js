const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
  let Auction, auction, seller, bidder1, bidder2;
  const AUCTION_DURATION = 60; // 60 seconds

  beforeEach(async function () {
    [seller, bidder1, bidder2] = await ethers.getSigners();

    Auction = await ethers.getContractFactory("Auction", seller);
    auction = await Auction.deploy(AUCTION_DURATION);
    await auction.deployed();
  });

  it("should deploy with correct seller and duration", async function () {
    expect(await auction.seller()).to.equal(seller.address);
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    expect(await auction.endTime()).to.be.greaterThan(now);
  });

  it("should accept a valid bid", async function () {
    await auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") });
    expect(await auction.highestBidder()).to.equal(bidder1.address);
    expect(await auction.highestBid()).to.equal(ethers.utils.parseEther("1"));
  });

  it("should reject lower or equal bids", async function () {
    await auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") });
    await expect(
      auction.connect(bidder2).bid({ value: ethers.utils.parseEther("0.5") })
    ).to.be.revertedWith("There already is a higher bid");
  });

  it("should allow previous bidder to withdraw", async function () {
    await auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") });
    await auction.connect(bidder2).bid({ value: ethers.utils.parseEther("2") });

    const initialBalance = await ethers.provider.getBalance(bidder1.address);

    const tx = await auction.connect(bidder1).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    const finalBalance = await ethers.provider.getBalance(bidder1.address);
    expect(finalBalance).to.be.closeTo(
      initialBalance.add(ethers.utils.parseEther("1")).sub(gasUsed),
      ethers.utils.parseEther("0.001")
    );
  });

  it("should end auction and send funds to seller", async function () {
    await auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") });

    // Wait until auction ends
    await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION]);
    await ethers.provider.send("evm_mine");

    const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

    const tx = await auction.connect(bidder1).endAuction();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

    const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

    expect(sellerBalanceAfter).to.equal(
      sellerBalanceBefore.add(ethers.utils.parseEther("1"))
    );
    expect(await auction.ended()).to.equal(true);
  });

  it("should not allow bids after auction ends", async function () {
    await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
    await ethers.provider.send("evm_mine");

    await expect(
      auction.connect(bidder1).bid({ value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("Auction already ended");
  });
});
