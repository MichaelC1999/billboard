pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/// @title ProtocolToken
/// @author Michael Manzano
/// @notice This contract is for the protocol token that gives access to protocol fees collected on ad spend
contract ProtocolToken is ERC20Votes {
    
    uint256 public initialSupply = 1000000000000000000000000;

    /// @notice During testing, the contract deployer gets tokens minted to their address
    constructor() ERC20("Billboard", "BILL") ERC20Permit("Billboard") {
        _mint(msg.sender, initialSupply);
    }
    
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}