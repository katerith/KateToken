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


contract('KateToken', (accounts) => {

    describe('Construction', async () => {

        it('should match name/symbol/totalSupply/decimals/owner succesfully', async () => {
           
            if (Array.isArray(accounts)) 
                accounts = await verboseAccounts(accounts);  
            const { kateToken } = await deployMock(accounts);
                
            assert.equal(await kateToken.name(), 'KateToken');
            assert.equal(await kateToken.symbol(), 'KTN');
            assertBn(await kateToken.decimals(), 18);
            assert.equal(await kateToken.owner(), accounts.owner);    
            assertBn(fromWei(await kateToken.totalSupply()), 1000000);
        });

        it('should give the owner 1M tokens', async () => {

            const { kateToken } = await deployMock(accounts);
           
            let balance = fromWei(await kateToken.balanceOf(accounts.owner));

            assert.equal(balance, 1000000, 'Balances not equal, exact 1M tokens have not been trasfered to owner');
        });

        it('the contract should be unpaused right after construction', async () => {

            const { kateToken } = await deployMock(accounts);

            assert.equal(await kateToken.paused(), false, 'the contract was paused at the construction');
        });

        it('every address should be unfrozen right after construction/every address should be able to check that', async () => {

            const { kateToken } = await deployMock(accounts);

            const accountsArray = Object.entries(accounts);            

            for(let i=0; i<accountsArray.length; i++) {
                assert.equal(await kateToken.isFrozen(accountsArray[i][1], { from: accountsArray[i][1] }), false, 'the address was frozen at the construction');
            };
        });
    });

    describe('Mint/Burn and onlyOwner modifier', () => {

        it('Owner should be able to mint a token amount', async () => {
            
            const { kateToken } = await deployMock(accounts);

            let ownerBalanceBEFORE = fromWei(await kateToken.balanceOf(accounts.owner));
            let totalSupplyBEFORE = fromWei(await kateToken.totalSupply());

            await kateToken.mint(toWei('1000'), { from: accounts.owner });

            // convert #balances from string to number in order to make calculations
            let ownerBalanceAFTER= parseInt(fromWei(await kateToken.balanceOf(accounts.owner)));
            let totalSupplyAFTER = parseInt(fromWei(await kateToken.totalSupply()));

            assert.equal(ownerBalanceBEFORE, ownerBalanceAFTER-1000, 'owner"s balance did not increased by minted amount');
            assert.equal(totalSupplyBEFORE, totalSupplyAFTER-1000, 'totalSupply did not increased by minted amount');     
        })

        it('Owner should be able to burn a token amount', async () => {
            
            const { kateToken } = await deployMock(accounts);

            let ownerBalanceBEFORE = fromWei(await kateToken.balanceOf(accounts.owner));
            let totalSupplyBEFORE = fromWei(await kateToken.totalSupply());

            await kateToken.burn(toWei('1000'), { from: accounts.owner });

            // convert #balances from string to number in order to make calculations
            let ownerBalanceAFTER = parseInt(fromWei(await kateToken.balanceOf(accounts.owner)));
            let totalSupplyAFTER = parseInt(fromWei(await kateToken.totalSupply()));

            assert.equal(ownerBalanceBEFORE, ownerBalanceAFTER+1000, 'owner"s balance did not decreased by burned amount');
            assert.equal(totalSupplyBEFORE, totalSupplyAFTER+1000, 'totalSupply did not decreased by burned amount'); 
        });

        it('Owner should NOT be able to burn a token amount larger that its available balance', async () => {
            
            const { kateToken } = await deployMock(accounts);

            // Make a transfer to account1 by 500.000 tokens
            await kateToken.transfer(accounts.account1, toWei('500000'), { from: accounts.owner });

            // Burn from owner an amount more than owner's balance, less than totalSupply
            await assertErrors(kateToken.burn(toWei('600000'), { from: accounts.owner }), 'ERC20: burn amount exceeds balance'); 
        });

        it('No other account than owner should be able to mint a token amount', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);
            
            // check for every account exept owner's that can not mint tokens 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken.mint(toWei('1000'), { from: accountsArray[i][1] }), 'Ownable: caller is not the owner'); 
            };
        });

        it('No other account than owner should be able to burn a token amount', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);
            
            // check for every account exept owner's that can not burn tokens 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken.burn(toWei('1000'), { from: accountsArray[i][1] }), 'Ownable: caller is not the owner'); 
            };
        });
    });

    describe('Pausable/Freezable', () => {

        it('when contract is unpaused OWNER should be able to pause it', async () => {

            const { kateToken } = await deployMock(accounts);

            // pause the contract
            let pauseIT = await kateToken.mockPause({ from: accounts.owner });

            assert.equal(pauseIT.receipt.status, true, 'the contract was NOT paused while unpaused by OWNER');
        });

        it('when contract is paused OWNER should be able to unpause it', async () => {

            const { kateToken } = await deployMock(accounts);

            // pause the contract
            await kateToken.mockPause({ from: accounts.owner });

            // unpause the contract
            unPauseIT = await kateToken.mockUnpause({ from: accounts.owner });

            assert.equal(unPauseIT.receipt.status, true, 'the contract was NOT unpaused while paused by OWNER');
        });

        it('when contract is unpaused it should NOT be able to unpause it again', async () => {

            const { kateToken } = await deployMock(accounts);
           
            // contract is unpaused, should not be able to unpause it again
            await assertErrors(kateToken.mockUnpause(), 'Pausable: not paused');
        });

        it('when contract is paused it should NOT be able to pause it again', async () => {

            const { kateToken } = await deployMock(accounts);

            // pause the contract
            await kateToken.mockPause();
           
            // should not be able to pause it again
            await assertErrors(kateToken.mockPause(), 'Pausable: paused');
        });

        it('No other account than owner should be able to pause the contract', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);
            
            // check for every account exept owner's that can NOT pause the contract 
            for(let i=1; i<accountsArray.length; i++) {
                await assertErrors(kateToken.mockPause({ from: accountsArray[i][1] }), 'Ownable: caller is not the owner'); 
            };
        });

        it('No other account than owner should be able to unpause the contract', async () => {
            
            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            // pause the contract
            await kateToken.mockPause();
            
            // check for every account exept owner's that can NOT pause the contract 
            for(let i=1; i<accountsArray.length; i++) {
                assert.equal(unPauseIT.receipt.status, true, 'the contract was NOT unpaused while paused by OWNER');
            };
        });

        it('Owner should be able to freeze addresses', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);
 
            for(let i=0; i<accountsArray.length; i++) {

                let freezeAccount = await kateToken.freeze(accountsArray[i][1], { from: accountsArray[0][1] });

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], { from: accountsArray[i][1] }), true, 'the address did NOT froze by executing freeze function');
                assert.equal(freezeAccount.receipt.status, true, 'the freeze proceess was not succesful');
            };
        });

        it('Owner should be able to unfreeze addresses', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze all the addresses by Owner to unfreeze them next
            for(let i=0; i<accountsArray.length; i++) {

                let freezeAccount = await kateToken.freeze(accountsArray[i][1], { from: accountsArray[0][1] });

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], { from: accountsArray[i][1] }), true, 'the address did NOT froze by executing freeze function');
                assert.equal(freezeAccount.receipt.status, true, 'the freeze proceess was not succesful');
            };

            // unfreeze all the addresses by Owner
            for(let i=0; i<accountsArray.length; i++) {

                let unFreezeAccount = await kateToken.unFreeze(accountsArray[i][1], { from: accountsArray[0][1] });

                assert.equal(await kateToken.isFrozen(accountsArray[i][1], { from: accountsArray[i][1] }), false, `the address did NOT unfreeze by executing unFreeze function`);
                assert.equal(unFreezeAccount.receipt.status, true, 'the freeze proceess was not succesful');
            };
        });

        it('No other account than owner should be able to freeze an address', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            // for every account than owner we try to freeze account1
            for(let i=1; i<accountsArray.length; i++) {              

                await assertErrors(kateToken.freeze(accountsArray[1][1], { from: accountsArray[i][1] }), 'Ownable: caller is not the owner');
                assert.equal(await kateToken.isFrozen(accountsArray[1][1]), false, 'the address account1 did freeze with msg.sender other than the owner');
            };
        });

        it('No other account than owner should be able to unfreeze an address', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze account1 to unfreeze it next
            await kateToken.freeze(accountsArray[1][1]);

            // for every account than owner we try to unfreeze account1
            for(let i=1; i<accountsArray.length; i++) {              

                await assertErrors(kateToken.unFreeze(accountsArray[1][1], { from: accountsArray[i][1] }), 'Ownable: caller is not the owner');
                assert.equal(await kateToken.isFrozen(accountsArray[1][1]), true, 'the address account1 did unfroze with msg.sender other than the owner');
            };
        });

        it('an Unfrozen address should be able to call whenNotFrozen Function', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            for(let i=1; i<accountsArray.length; i++) { 

                assert.equal(await kateToken.toCheckWhenNotFrozenModifier(accountsArray[i][1]), true, `the unfrozen address ${accountsArray[i][0]} ${accountsArray[i][1]} did not manage to call whenNotFrozen function`);
            }
        });

        it('a Frozen address should NOT be able to call whenNotFrozen Function', async () => {

            const { kateToken } = await deployMock(accounts);
            const accountsArray = Object.entries(accounts);

            // freeze all addresses 
            for(let i=1; i<accountsArray.length; i++) { 
                await kateToken.freeze(accountsArray[i][1]);

                await assertErrors(kateToken.toCheckWhenNotFrozenModifier(accountsArray[i][1]), 'Freezable : target is frozen');
            };
        });
    });

    // describe('Reentrant modifier', () => {

    //     it('On the first call of mockReentrant Function msg.sender should enter', async () => {

    //         const kateToken = await deploy(accounts);
    //         console.log('methods', kateToken.methods);

    //     });

    //     it('On the second call of mockReentrant Function procces should fail', async () => {

    //     });
    // });

});