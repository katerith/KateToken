// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

// import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
// import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './KateToken.sol';
// import './Freezable.sol';

contract KateTokenSale is Ownable, ReentrancyGuard {

    KateToken public kateToken;
     
    uint256 constant public tokensPerEth = 1000; // amount of tokens bought for 1 ETH
    uint256 public kateTokensSold;

    event Sell(address indexed _buyer, uint256 indexed _ethAmount, uint256 indexed _tokenAmount);

    constructor(KateToken _kateToken)  {
        kateToken = _kateToken;
    }

    function buyTokens() public payable returns (uint256) {
        require(msg.value > 0, "KateTokenSale: msg.value not enough to buy Tokens");

        uint256 numberOfKateTokens = msg.value * tokensPerEth;

        // check if the kateToken Contract has enough amount of tokens for the transaction
        require( kateToken.balanceOf(address(this)) >= numberOfKateTokens, "KateTokenSale: not enough tokens to buy");

        // Transfer tokens to the msg.sender
        (bool success) = kateToken.transfer(msg.sender, numberOfKateTokens);
        require(success, "KateTokenSale: transfer of tokens failed");

        kateTokensSold += numberOfKateTokens;

        // emit sell event
        emit Sell(msg.sender, msg.value, numberOfKateTokens);

        return numberOfKateTokens;
    }
    
    // function buyTokens(uint256 _numberOfKateTokens) public payable returns (uint256) {
    //     require(msg.value == _numberOfKateTokens * kateTokenPrice, "KateTokenSale: msg.value is not the expected according to tokenPrice");
        
    //     require( kateToken._approve(owner(), msg.sender, _numberOfKateTokens), "KateTokenSale: token approval from owner to msg.sender NOT succesful");
    //     require( kateToken.transferFrom(owner(), msg.sender, _numberOfKateTokens), "KateTokenSale: transfer of tokens Not succesful");

    //     uint256 balance = kateToken.balanceOf(owner());
    //     require( balance >= _numberOfKateTokens, "KateTokenSale: not enough tokens to buy");

    //     (bool success) = kateToken.transfer(msg.sender, _numberOfKateTokens);
    //     require(success, "KateTokenSale: transfer of tokens Not succesful");

    //     kateTokensSold += _numberOfKateTokens;

    //     emit Sell(msg.sender, _numberOfKateTokens);
    //     return _numberOfKateTokens;
    // }
}