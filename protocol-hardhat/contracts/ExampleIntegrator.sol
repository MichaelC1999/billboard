// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExampleIntegrator is ERC721 {

    //This contract is for a dummy NFT protocol that uses a Billboard integrator for ad revenue
    //This protocol mints an NFT to the msg.sender address
    //The mintNFT() function will be called from the routeInteraction() function on the integrator contract deployed for this protocol  
    //While a dApp could just call mintNFT() without routing through the integrator contract, no ad view will be recorded

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;

    constructor() ERC721("Example", "EXP") {}

    function mintNFT(address sender) public {
        tokenIds.increment();
        uint256 newItemId = tokenIds.current();
        _mint(sender, newItemId);
    }
}