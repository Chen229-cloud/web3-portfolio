// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant MINT_PRICE = 0.01 ether;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    function mint() public payable {
        require(_nextTokenId < MAX_SUPPLY, "Sold out");
        require(msg.value >= MINT_PRICE, "Insufficient payment");

        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(msg.sender, tokenId);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
}