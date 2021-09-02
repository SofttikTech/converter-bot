pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract WBNB is ERC20Burnable, ERC20Detailed {
    constructor() public ERC20Detailed("Wrapped BNB", "WBNB", 18) {
       uint256 _totalSupply = 1000000000000000000000000000000000000000000; // Total Supply will be 1 Billion
        _mint(msg.sender, _totalSupply);
    }
}
