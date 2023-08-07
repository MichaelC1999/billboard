// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExampleIntegrator is ERC721 {

    //This contract is an example of an integrator protocol
    //This protocol mints an NFT to the msg.sender address
    //This protocol routes its contract transactions through Billboard, allowing it to collect revenue from ad spend after displaying ads within Metamask snaps on its frontend

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    constructor() ERC721("Example", "EXP") {}

    function mintNFT(address sender) public {
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(sender, newItemId);
    }
}