// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Simple Auction Contract
/// @author Mariia
/// @notice A time-limited auction where the highest bidder wins and others can withdraw their bids
contract Auction {
    address public seller;             // The address of the auction creator
    uint public endTime;              // Timestamp when the auction ends

    address public highestBidder;     // Address of the current highest bidder
    uint public highestBid;           // Amount of the highest bid

    mapping(address => uint) public bids; // Refundable balances for outbid bidders

    bool public ended;                // Auction finalization flag

    event BidPlaced(address indexed bidder, uint amount);         // Emitted when a new bid is placed
    event AuctionEnded(address winner, uint amount);              // Emitted when the auction ends
    event Withdrawn(address indexed bidder, uint amount);         // Emitted when a bidder withdraws their outbid amount

    /// @notice Initializes the auction with a duration
    /// @param _biddingTimeInSeconds Duration of the auction in seconds
    constructor(uint _biddingTimeInSeconds) {
        seller = msg.sender;
        endTime = block.timestamp + _biddingTimeInSeconds;
    }

    /// @notice Place a bid. The bid must be higher than the current highest bid.
    /// @dev Refunds the previous highest bidder
    function bid() external payable {
        if (block.timestamp >= endTime) revert("Auction already ended");
        if (msg.value <= highestBid) revert("There already is a higher bid");

        if (highestBid != 0) {
            // Save the amount for the previous highest bidder to withdraw
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit BidPlaced(msg.sender, msg.value);
    }

    /// @notice Withdraw funds if the sender was outbid
    function withdraw() external {
        uint amount = bids[msg.sender];
        if (amount == 0) revert("Nothing to withdraw");

        bids[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice End the auction and transfer the highest bid to the seller
    function endAuction() external {
        if (block.timestamp < endTime) revert("Auction not yet ended");
        if (ended) revert("Auction already ended");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        (bool sent, ) = seller.call{value: highestBid}("");
        require(sent, "Transfer to seller failed");
    }
}
