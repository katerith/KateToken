// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './Freezable.sol';

contract KateToken is ERC20, Ownable, Pausable, Freezable, ReentrancyGuard {

    mapping(address => uint256) private _balances;
    address private _owner;

    constructor() ERC20("KateToken", "KTN") {
        mint(1_000_000 ether);
      
        emit Transfer(address(0), _owner, _balances[_owner]);
    }

    function mint(uint amount) public onlyOwner {
        super._mint(msg.sender, amount);
    }

    function burn(uint amount) external onlyOwner {
        super._burn(msg.sender, amount);
    }

    function mockPause() public onlyOwner {
        _pause();
    }

    function mockUnpause() public onlyOwner {
        _unpause();
    }
}