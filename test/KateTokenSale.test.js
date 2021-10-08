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

    const tokensPerEth = 100000; // token price for 1 ETH
    const totalSupply = '1000000';

    describe('Construction', () => {

        it('should pass addresses and match input addresses/owner/kateTokens per ether succesfully', async () => {

            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);     
            const { kateTokenSale } = await deployMock(accounts);

            let KateTokenAddress = await kateTokenSale.kateToken();

            assert.equal(await kateTokenSale.owner(), accounts.owner);
            assert.notEqual(kateTokenSale.address, 0x0, 'KateToken Contract was not deployed succesfully, its addresss is address(0)');
            assert.equal(await kateTokenSale.developmentFund(), accounts.developmentFund, 'developmentFund address did not pass as expected');
            assert.equal(await kateTokenSale.companyFund(), accounts.companyFund, 'companyFund address did not pass as expected');
            assert.notEqual(KateTokenAddress, 0x0, 'KateTokenSale Contract address was not passed succesfully, its addresss is address(0)');
            assert.equal(await kateTokenSale.tokensPerEth(), 100000, 'price different than expected, 1000000000000000 in Wei, 0.001 ether');
        });
    });

    describe('Buying tokens process', () => {

        it('should fail if msg.value is zero', async () => {
   
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            // transfer to the kateTokenSale contract 900.000/1.000.000(totalSupply) tokens from owner
            await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('900000'), {from: accounts.owner});
        
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: 0 }), 'KateTokenSale: msg.value not enough to buy Tokens');
        });

        it('should fail if account is buying more tokens than available in the contract"s balance', async () => {
    
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            let numberOfTokens = '101';
            value = (numberOfTokens/tokensPerEth).toString();

            // transfer to the kateTokenSale contract 100/1.000.000(totalSupply) tokens from owner
            await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('100'), {from: accounts.owner});

            // attemt to buy 101 tokens, 1 more than available in contract
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(value) }), 'KateTokenSale: not enough tokens to buy');
        });

        it('should fail if 70% of tokens available for sale are already sold', async () => {
    
            const { kateToken, kateTokenSale } = await deployMock(accounts);

            // the max amount of tokens that can be sold
            let numberOfTokens = '700000';
            value = (numberOfTokens/tokensPerEth).toString();

            await kateToken.approve(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei(totalSupply), {from: accounts.owner});

            // buy the max amount of tokens that can be sold
            await kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(value) });

            // attemt to buy one extra token that sould fail 
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: toWei('1') }), 'KateTokenSale: the 70% of total supply available is already sold');
        });

        it('should fail if desired amount of tokens + the already sold exceed the 70% of available to be sold', async () => {

            const { kateToken, kateTokenSale } = await deployMock(accounts);

            // an amount of tokens that can be sold
            let numberOfTokens = '600000';
            value = (numberOfTokens/tokensPerEth).toString();

            // an extra amount of tokens that can not be sold
            let extraNumberOfTokens = '100001';
            extraValue = (extraNumberOfTokens/tokensPerEth).toString();

            await kateToken.approve(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei(totalSupply), {from: accounts.owner});

            await kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(value) });

            // attemt to buy more tokens than already available, 100.001 tokens 
            await assertErrors(kateTokenSale.buyTokens({ from: accounts.account1, value: toWei(extraValue) }), 'KateTokenSale: the 70% of total supply available is already sold');
        });

        it('selling tokens with success/emit Sell event/track tokensSold and buyer-owner balances', async () => {

            const { kateToken, kateTokenSale } = await deployMock(accounts);

            let numberOfTokens = '100';
            value = (numberOfTokens/tokensPerEth).toString();

            // initial owner's balance, should be totalSupply
            let ownerBalance_Before = fromWei(await kateToken.balanceOf(accounts.owner))
            // initial contract balance, should be zero
            let contractBalance_0 = fromWei(await kateToken.balanceOf(kateTokenSale.address))

            // transfer to the kateTokenSale contract 900.000/1.000.000(totalSupply) tokens from owner
            // await kateToken.approve.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            // await kateToken.increaseAllowance.sendTransaction(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            // await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei('900000'), {from: accounts.owner});

            await kateToken.approve(accounts.owner, toWei(totalSupply), { from: accounts.owner });
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

    describe('Vesting tokens process', () => {

        it('should fail if start date is set in the past', async () => {
    
            const { kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();
        
            await assertErrors(kateTokenSale.setStartDate(timestamp-10, { from: accounts.owner } ), 'KateTokenSale: Vesting proccess can not start in the past');
        })

        it('should fail if owner restarts vesting proccess', async () => {
    
            const { kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();

            await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )

            await assertErrors(kateTokenSale.setStartDate(timestamp+100, { from: accounts.owner } ), 'KateTokenSale: You can not restart vesting');
        });

        it('should pass if vesting duration is exact a year in seconds', async () => {
 
            const { kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();
            
            let startVesting = await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )
            
            let vestingDuration = await kateTokenSale.releaseDate() - await kateTokenSale.startDate();
            let yearInSeconds = 365*24*60*60;

            assert.equal(vestingDuration, yearInSeconds, 'Vesting Duration is not exact one year from the beginning');

            // TokensClaimed event
            assertEvents(startVesting.logs, kateTokenSale.StartDateSet);
            assert.equal(startVesting.logs.length, 1, 'event not unique');
            assert.equal(startVesting.logs[0].args._owner, accounts.owner, 'recipient was not the expected');
            assertBn(startVesting.logs[0].args._startDate, timestamp+10);
        });

        it('should fail if claim tokens is called from other account than developmentFund or companyFund', async () => {
    
            const { kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();

            await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )

            await assertErrors(kateTokenSale.claimTokens( { from: accounts.owner } ), 'KateTokenSale: You are not allowed to claim vested tokens');
        });

        it('should fail if claim tokens is called before vesting is over', async () => {
   
            const { kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();

            await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )

            await assertErrors(kateTokenSale.claimTokens( { from: accounts.developmentFund } ), 'KateTokenSale: Vesting has not ended');
            await assertErrors(kateTokenSale.claimTokens( { from: accounts.companyFund } ), 'KateTokenSale: Vesting has not ended');
        });

        it('should succeed if developmentFund and companyFund claim tokens after vestings period ends', async () => {
   
            const { kateToken, kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();

            // transfer to contract totalsupply, 1.000.000
            await kateToken.approve(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei(totalSupply), {from: accounts.owner});

            await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )

            // pretend that the releaseDate has come
            await kateTokenSale.setReleaseDateOnlyForTesting(timestamp, { from: accounts.owner } )

            let contractFund_1 = fromWei(await kateToken.balanceOf(kateTokenSale.address));
            let developmentFund_1 = fromWei(await kateToken.balanceOf(accounts.developmentFund));
            let companyFund_1 = fromWei(await kateToken.balanceOf(accounts.companyFund));

            let devClaimTokens = await kateTokenSale.claimTokens( { from: accounts.developmentFund } )
            let compClaimTokens = await kateTokenSale.claimTokens( { from: accounts.companyFund } )

            let contractFund_2 = fromWei(await kateToken.balanceOf(kateTokenSale.address));
            let developmentFund_2 = fromWei(await kateToken.balanceOf(accounts.developmentFund));
            let companyFund_2 = fromWei(await kateToken.balanceOf(accounts.companyFund));

            // token tracking
            assert.equal(contractFund_1, totalSupply, 'Contract balance is not the totalsupply');
            assert.equal(developmentFund_1, 0, 'Development balance is not zero before claim');
            assert.equal(companyFund_1, 0, 'Company balance is not zero before claim');

            assert.equal(contractFund_2, totalSupply - developmentFund_2 - companyFund_2, 'Contract balance was not decreased by the transferred amounts');
            assert.equal(developmentFund_2, totalSupply * 0.2, 'Development balance was not increased by the 20% of totalsupply');
            assert.equal(companyFund_2, totalSupply * 0.1, 'Company balance was not increased by the 10% of totalsupply');

            // TokensClaimed event
            assertEvents(devClaimTokens.logs, kateTokenSale.TokensClaimed);
            assert.equal(devClaimTokens.logs.length, 1, 'event not unique');
            assert.equal(devClaimTokens.logs[0].args._recipient, accounts.developmentFund, 'recipient was not the expected');
            assertBn(devClaimTokens.logs[0].args._amount, toWei((totalSupply * 0.2).toString()));

            assertEvents(compClaimTokens.logs, kateTokenSale.TokensClaimed);
            assert.equal(compClaimTokens.logs.length, 1, 'event not unique');
            assert.equal(compClaimTokens.logs[0].args._recipient, accounts.companyFund, 'recipient was not the expected');
            assertBn(compClaimTokens.logs[0].args._amount, toWei((totalSupply * 0.1).toString()));
        });

        it('should fail if developmentFund and companyFund call claimTokens for a second time ', async () => {
  
            const { kateToken, kateTokenSale } = await deployMock(accounts);
            const timestamp = await kateTokenSale.getTimeStamp();

            // transfer to contract totalsupply, 1.000.000
            await kateToken.approve(accounts.owner, toWei(totalSupply), { from: accounts.owner });
            await kateToken.transferFrom(accounts.owner, kateTokenSale.address, toWei(totalSupply), {from: accounts.owner});

            await kateTokenSale.setStartDate(timestamp+10, { from: accounts.owner } )

            // pretend that the releaseDate has come
            await kateTokenSale.setReleaseDateOnlyForTesting(timestamp, { from: accounts.owner } )

            // claim tokens once
            await kateTokenSale.claimTokens( { from: accounts.developmentFund } )
            await kateTokenSale.claimTokens( { from: accounts.companyFund } )

            // claim tokens twice, should fail     
            await assertErrors(kateTokenSale.claimTokens( { from: accounts.developmentFund } ), 'KateTokenSale: vested tokens already claimed');
            await assertErrors(kateTokenSale.claimTokens( { from: accounts.companyFund } ), 'KateTokenSale: vested tokens already claimed');
        });

    });
});

