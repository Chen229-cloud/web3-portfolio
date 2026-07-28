// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Faucet {
    address public immutable owner;
    uint256 public constant DRIP_AMOUNT = 0.05 ether;
    uint256 public constant COOLDOWN = 1 hours;
    
    mapping(address => uint256) public lastDrip;

    event Drip(address indexed to, uint256 amount, uint256 timestamp);
    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function drip() external {
        require(block.timestamp >= lastDrip[msg.sender] + COOLDOWN, "Cooldown not elapsed");
        require(address(this).balance >= DRIP_AMOUNT, "Faucet empty");

        lastDrip[msg.sender] = block.timestamp;
        emit Drip(msg.sender, DRIP_AMOUNT, block.timestamp);  // CEI: event before transfer
        payable(msg.sender).transfer(DRIP_AMOUNT);
    }

    function timeUntilNextDrip(address user) external view returns (uint256) {
        if (block.timestamp >= lastDrip[user] + COOLDOWN) return 0;
        return lastDrip[user] + COOLDOWN - block.timestamp;
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        emit Withdrawn(owner, balance);  // CEI: event before transfer
        payable(owner).transfer(balance);
    }
}