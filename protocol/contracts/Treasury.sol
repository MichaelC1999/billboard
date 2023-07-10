pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Treasury
/// @author Michael Manzano
/// @notice This contract is for handling protocol level revenues
contract Treasury {
    address public protocolToken;

    function initialize(address tokenAddress) external {
        protocolToken = tokenAddress;
    }


}
