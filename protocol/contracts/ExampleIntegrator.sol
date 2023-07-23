// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ExampleIntegrator is ERC20("Test", "TST"), ERC721("EmptyNFT", "NFT") {
    constructor() {
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
    function mintEmptyNFT() public {
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
    }
}
