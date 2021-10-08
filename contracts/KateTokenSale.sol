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
     
    uint256 constant public tokensPerEth = 100000; // amount of tokens bought for 1 ETH
    uint256 public kateTokensSold;

    // Token Distribution
    uint256 public kateTokenSalePercentage   = 70;
    uint256 public developmentPercentage     = 20;
    uint256 public companyPercentage         = 10;

    // Token funds
    address public developmentFund;
    address public companyFund;

    // Vesting duration 
    uint256 public startDate;
    uint256 public releaseDate;

    // funds mutex for the tokens to be claimed only once
    bool isDevelopmentFundClaimed;
    bool isCompanyFundClaimed;

    // events
    event Sell(address indexed _buyer, uint256 indexed _ethAmount, uint256 indexed _tokenAmount);
    event StartDateSet(address _owner, uint256 _startDate);
    event TokensClaimed(address _recipient, uint256 _amount);

    constructor(
        KateToken _kateToken, 
        address _developmentFund, 
        address _companyFund
    )  {
        kateToken = _kateToken;
        developmentFund = _developmentFund;
        companyFund = _companyFund;
    }

    function buyTokens() public payable returns (uint256) {
        require(msg.value > 0, "KateTokenSale: msg.value not enough to buy Tokens");

        uint256 numberOfKateTokens = msg.value * tokensPerEth;

        // check if the kateToken Contract has enough amount of tokens for the transaction
        require( kateToken.balanceOf(address(this)) >= numberOfKateTokens, "KateTokenSale: not enough tokens to buy");

        // check if the available kateTokens for sale are already sold
        require( kateTokensSold + numberOfKateTokens <= kateToken.totalSupply()*kateTokenSalePercentage/100, 'KateTokenSale: the 70% of total supply available is already sold');

        // Transfer tokens to the msg.sender
        (bool success) = kateToken.transfer(msg.sender, numberOfKateTokens);
        require(success, "KateTokenSale: transfer of tokens failed");

        kateTokensSold += numberOfKateTokens;

        // emit sell event
        emit Sell(msg.sender, msg.value, numberOfKateTokens);

        return numberOfKateTokens;
    }

    function setStartDate(uint256 _startDate) public onlyOwner {
        require(startDate == 0, 'KateTokenSale: You can not restart vesting');
        require(_startDate >= block.timestamp, 'KateTokenSale: Vesting proccess can not start in the past');

        startDate = _startDate;
        releaseDate = startDate + 365 days;

        emit StartDateSet(msg.sender, _startDate);
    }

    function claimTokens() public {
        require(msg.sender == developmentFund || msg.sender == companyFund, 'KateTokenSale: You are not allowed to claim vested tokens');
        require(block.timestamp >= releaseDate, 'KateTokenSale: Vesting has not ended');

        // calculate tha amount tokens to be transfered to developmentFund or to companyFund
        uint256 amount = _calculateTokens();

        // Transfer tokens to developmentFund or to companyFund
        (bool success) = kateToken.transfer(msg.sender, amount);
        require(success, "KateTokenSale: transfer of vested tokens failed");

        emit TokensClaimed(msg.sender, amount);
    }

    function _calculateTokens() internal returns(uint256 amount) {

        if ( msg.sender == developmentFund) {
            require(!isDevelopmentFundClaimed , "KateTokenSale: vested tokens already claimed");

            amount = kateToken.totalSupply()*developmentPercentage/100;
            isDevelopmentFundClaimed = true;
        } 
        else if ( msg.sender == companyFund ) {
            require(!isCompanyFundClaimed , "KateTokenSale: vested tokens already claimed");

            amount = kateToken.totalSupply()*companyPercentage/100;
            isCompanyFundClaimed = true;
        }
    }

    function getTimeStamp() public view returns(uint256) {
        return block.timestamp;
    }

    function setReleaseDateOnlyForTesting(uint256 _releaseDate) public onlyOwner {
        releaseDate = _releaseDate;
    }
}