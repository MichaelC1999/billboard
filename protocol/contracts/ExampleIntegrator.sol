// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ExampleIntegrator is ERC20("Test", "TST") {
    constructor() {
        _mint(msg.sender, 1000 * 10**decimals());
    }
    
//    function mintEmptyNFT() public {
//        uint256 tokenId = totalSupply();
//        _safeMint(msg.sender, tokenId);
//    }
}
