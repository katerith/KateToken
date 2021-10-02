const {
    // Deployment Function
    deployMock,
  
    // Testing Utilities
    log,
    assertBn,
    assertEvents,
    assertErrors,
    UNSET_ADDRESS,
    TEN_UNITS,
  
    // Library Functions
    parseUnits,
    getNativeBalance,
    verboseAccounts,
    big,
    time,
    fromWei,
    toWei,
  
    // Project Specific Constants
    PROJECT_CONSTANTS,
    DEFAULT_CONFIGS,
} = require("./utils")(artifacts);
  
  
const { web3 } = require('@openzeppelin/test-helpers/src/setup');


contract('KateTokenSale', (accounts) => {

    const tokensPerEth = 1000; // token price for 1 ETH
    const totalSupply = '1000000';

    describe('Construction', () => {

        it('should pass addresses and match owner/kateTokens per ether succesfully', async () => {

            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);     
            const { kateTokenSale } = await deployMock(accounts);

            let KateTokenAddress = await kateTokenSale.kateToken();

            assert.equal(await kateTokenSale.owner(), accounts.owner);
            assert.notEqual(kateTokenSale.address, 0x0, 'KateToken Contract was not deployed succesfully, its addresss is address(0)');
            assert.notEqual(KateTokenAddress, 0x0, 'KateTokenSale Contract address was not passed succesfully, its addresss is address(0)');
            assert.equal(await kateTokenSale.tokensPerEth(), 1000, 'price different than expected, 1000000000000000 in Wei, 0.001 ether');
        });
    });

    describe('Buying tokens process', () => {

        it('should fail if msg.value is zero', async () => {

            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);     
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            // transfer to the kateTokenSale contract 900.000/1.000.000(totalSupply) tokens from owner
            await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('900000'), {from: accounts.owner});
        
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: 0 }), 'KateTokenSale: msg.value not enough to buy Tokens');
        });

        it('should fail if account is buying more tokens than available in the contract"s balance', async () => {

            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);     
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            let numberOfTokens = '101';
            value = (numberOfTokens/tokensPerEth).toString();

            // transfer to the kateTokenSale contract 100/1.000.000(totalSupply) tokens from owner
            await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('100'), {from: accounts.owner});

            // attemt to buy 101 tokens, 1 more than available in contract
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(value) }), 'KateTokenSale: not enough tokens to buy');
        })

        it('selling tokens with success/emit Sell event/track tokensSold and buyer-owner balances', async () => {

            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);     
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            let numberOfTokens = '100';
            value = (numberOfTokens/tokensPerEth).toString();

            // initial owner's balance, should be totalSupply
            let ownerBalance_Before = fromWei(await kateToken.balanceOf(accounts.owner))
            // initial contract balance, should be zero
            let contractBalance_0 = fromWei(await kateToken.balanceOf(kateTokenSale.address))

            // transfer to the kateTokenSale contract 900.000/1.000.000(totalSupply) tokens from owner
            await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('900000'), {from: accounts.owner});

            // owner's balance after transfering 900000 tokens to the contract
            let ownerBalance_After = fromWei(await kateToken.balanceOf(accounts.owner));
            // contract balance, after transfering 900000 tokens
            let contractBalance_1 = fromWei(await kateToken.balanceOf(kateTokenSale.address));
            // tokensSold before buying, should be zero
            let tokenSold_Before = fromWei(await kateTokenSale.kateTokensSold());
            // buyer's before buying, should be zero
            let buyersBalance_Before = fromWei(await kateToken.balanceOf(accounts.account1));

            // attemt to buy tokens with 1 ether
            let tokensBought = await kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(value) });

            // contract balance, after buying tokens with 1 eth
            let contractBalance_2 = fromWei(await kateToken.balanceOf(kateTokenSale.address));
            // tokensSold after buying
            let tokenSold_After = fromWei(await kateTokenSale.kateTokensSold());
            // buyer's after buying
            let buyersBalance_After = fromWei(await kateToken.balanceOf(accounts.account1));


            // token tracking
            assert.equal(tokenSold_Before, tokenSold_After - numberOfTokens, 'tokens Sold did not increased according to the amount bought');
            assert.equal(ownerBalance_Before, parseInt(ownerBalance_After) + 900000, 'ownerBalance did not decreased according to the transfering amount');
            assert.equal(contractBalance_0, parseInt(contractBalance_1) - 900000, 'contract balance did not increased according to the transfering amount');
            assert.equal(contractBalance_1, parseInt(contractBalance_2) + parseInt(numberOfTokens), 'tokens Sold did not decreased according to the amount bought');
            assert.equal(buyersBalance_Before, parseInt(buyersBalance_After) - parseInt(numberOfTokens), 'ontract balance did not increased according to the amount bought')
            
            // sell event
            assertEvents(tokensBought.logs, kateTokenSale.Sell);
            assert.equal(tokensBought.logs.length, 1, 'event not unique');
            assert.equal(tokensBought.logs[0].args._buyer, accounts.account1, 'buyer was not the expected');
            assertBn(tokensBought.logs[0].args._tokenAmount, toWei(numberOfTokens))
            assertBn(tokensBought.logs[0].args._ethAmount, toWei(value))
        });
    });
});

